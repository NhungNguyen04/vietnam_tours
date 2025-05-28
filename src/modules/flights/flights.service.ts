import { Injectable, HttpException, HttpStatus, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map, catchError } from 'rxjs';
import { AxiosError } from 'axios';

// ... (your interfaces and DTOs if any) ...

@Injectable()
export class FlightsService implements OnModuleInit {
  private readonly logger = new Logger(FlightsService.name);
  private amadeusClientId!: string;
  private amadeusClientSecret!: string;
  private amadeusApiBaseUrl!: string;
  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // ... your existing onModuleInit logic to load and validate configs ...
    // For example:
    this.amadeusClientId = this.configService.get<string>('AMADEUS_CLIENT_ID') as string;
    this.amadeusClientSecret = this.configService.get<string>('AMADEUS_CLIENT_SECRET') as string;
    this.amadeusApiBaseUrl = this.configService.get<string>('AMADEUS_API_BASE_URL') as string;

    if (!this.amadeusClientId || !this.amadeusClientSecret || !this.amadeusApiBaseUrl) {
      this.logger.error('One or more Amadeus config variables are missing.');
      throw new Error('Critical Amadeus configuration missing.');
    }
    this.logger.log('FlightsService initialized with Amadeus config.');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      this.logger.log('Using cached Amadeus access token');
      // If this.accessToken exists and is valid, it's guaranteed to be a string here
      // by the logic that sets it. So, a type assertion is safe.
      return this.accessToken as string; // <--- FIX: Add "as string"
    }

    this.logger.log('Fetching new Amadeus access token');
    const tokenUrl = `${this.amadeusApiBaseUrl}/v1/security/oauth2/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.amadeusClientId);
    params.append('client_secret', this.amadeusClientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).pipe(
          map(res => res.data),
          catchError((error: AxiosError) => {
            this.logger.error('Error fetching Amadeus token:', error.response?.data || error.message);
            throw new HttpException('Failed to authenticate with Amadeus', HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );

      if (!response.access_token) { // Additional check
          this.logger.error('Amadeus token response did not contain access_token', response);
          throw new HttpException('Invalid token response from Amadeus', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      this.accessToken = response.access_token;
      this.tokenExpiryTime = Date.now() + (response.expires_in - 300) * 1000;
      this.logger.log(`New token obtained, expires in: ${response.expires_in}s`);
      return this.accessToken as string; // This will be a string
    } catch (error) {
      this.logger.error('Failed to get access token', error.stack);
      // Ensure accessToken is nulled out if fetching failed
      this.accessToken = null;
      this.tokenExpiryTime = null;
      if (error instanceof HttpException) throw error;
      throw new HttpException('Amadeus authentication failed', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  // ... rest of your searchFlights method etc.
  async searchFlights(searchParams: any): Promise<any> { // Replace 'any' with your actual response type
    const token = await this.getAccessToken(); // This will now correctly be a string
    const searchUrl = `${this.amadeusApiBaseUrl}/v2/shopping/flight-offers`;

    // ... (rest of your searchFlights logic)
    const queryParams = { ...searchParams };
    if (queryParams.adults) queryParams.adults = Number(queryParams.adults);
    // ... other param processing ...

    this.logger.log(`Searching flights with params: ${JSON.stringify(queryParams)} using token: ${token.substring(0,10)}...`); // Log part of token for verification

    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(searchUrl, { // Replace 'any' with AmadeusFlightSearchResponse
          headers: { Authorization: `Bearer ${token}` },
          params: queryParams,
        }).pipe(
          map(res => res.data),
          catchError((error: AxiosError) => {
            // ... your error handling ...
            this.logger.error(`Amadeus API Error: ${error.response?.status}`, error.response?.data || error.message);
            const amadeusError = error.response?.data as any;
            let message = 'Error fetching flights from Amadeus';
            if (amadeusError && amadeusError.errors && amadeusError.errors.length > 0) {
                message = amadeusError.errors.map(e => `${e.title} (code: ${e.code}): ${e.detail}`).join(', ');
            }
            throw new HttpException(
                {
                    statusCode: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    message: message,
                    amadeusErrors: amadeusError?.errors,
                },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
          }),
        ),
      );
      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Unexpected error during flight search', error.stack);
      throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
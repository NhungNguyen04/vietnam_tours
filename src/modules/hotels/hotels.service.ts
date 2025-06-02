import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HotelSearchDto } from './dto/hotel-search.dto';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async getAccessToken(): Promise<string> {
    // If token is still valid, reuse it
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      new Date() < this.tokenExpiresAt
    ) {
      return this.accessToken;
    }

    try {
      const clientId = this.configService.get<string>('AMADEUS_CLIENT_ID')!;
      const clientSecret = this.configService.get<string>(
        'AMADEUS_CLIENT_SECRET',
      )!;
      const baseUrl = this.configService.get<string>('AMADEUS_API_BASE_URL')!;

      if (!clientId || !clientSecret || !baseUrl) {
        throw new Error(
          'Amadeus credentials not configured. Please check your environment variables.',
        );
      }

      const response = await axios.post(
        `${baseUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Subtract 5 minutes (300s) for safety
      this.tokenExpiresAt = new Date(
        Date.now() + (response.data.expires_in - 300) * 1000,
      );

      this.logger.log('Successfully obtained Amadeus access token');
      return this.accessToken!;
    } catch (error) {
      this.logger.error('Failed to obtain Amadeus access token', error);
      throw new HttpException(
        'Failed to authenticate with Amadeus API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapAmenityCodes(amenities: string[]): string[] {
    const amenityMapping: Record<string, string> = {
      WIFI: 'WIFI',
      PARKING: 'PARKING',
      POOL: 'SWIMMING_POOL',
      GYM: 'FITNESS_CENTER',
      SPA: 'SPA',
      RESTAURANT: 'RESTAURANT',
      BAR: 'BAR',
      ROOM_SERVICE: 'ROOM_SERVICE',
      PETS_ALLOWED: 'PETS_ALLOWED',
      BUSINESS_CENTER: 'BUSINESS_CENTER',
      AIRPORT_SHUTTLE: 'AIRPORT_SHUTTLE',
      LAUNDRY: 'LAUNDRY',
      CONCIERGE: 'CONCIERGE',
      HANDICAP_FACILITIES: 'HANDICAP_FACILITIES',
      MEETING_FACILITIES: 'MEETING_FACILITIES',
      NO_SMOKING: 'NO_SMOKING',
      BABYSITTING: 'BABYSITTING',
      JACUZZI: 'JACUZZI',
      SAUNA: 'SAUNA',
      SOLARIUM: 'SOLARIUM',
      MASSAGE: 'MASSAGE',
    };

    return amenities
      .map((amenity) => amenityMapping[amenity] || amenity)
      .filter(Boolean);
  }

  async searchHotels(searchDto: HotelSearchDto): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const baseUrl = this.configService.get<string>('AMADEUS_API_BASE_URL')!;

      if (!baseUrl) {
        throw new Error('AMADEUS_API_BASE_URL not configured');
      }

      const params: Record<string, any> = {
        latitude: searchDto.latitude,
        longitude: searchDto.longitude,
        radius: searchDto.radius || 20,
        radiusUnit: searchDto.radiusUnit || 'KM',
      };

      if (searchDto.ratings && searchDto.ratings.length > 0) {
        params.ratings = searchDto.ratings.join(',');
      }

      if (searchDto.amenities && searchDto.amenities.length > 0) {
        const mappedAmenities = this.mapAmenityCodes(searchDto.amenities);
        if (mappedAmenities.length > 0) {
          params.amenities = mappedAmenities.join(',');
        }
      }

      if (searchDto.hotelSource && searchDto.hotelSource !== 'ALL') {
        params.hotelSource = searchDto.hotelSource;
      }

      this.logger.log(
        `Searching hotels with params: ${JSON.stringify(params)}`,
      );

      const response = await axios.get(
        `${baseUrl}/v1/reference-data/locations/hotels/by-geocode`,
        {
          params,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Found ${response.data.data?.length || 0} hotels`);

      return {
        success: true,
        message: 'Hotels retrieved successfully',
        data: response.data,
        count: response.data.data?.length || 0,
      };
    } catch (error) {
      this.logger.error('Error searching hotels:', error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.errors?.[0]?.detail || 'Failed to search hotels';

        throw new HttpException(
          {
            success: false,
            message,
            error: error.response.data,
          },
          status,
        );
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'Internal server error while searching hotels',
            error: (error as Error).message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}

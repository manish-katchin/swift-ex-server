import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { AlchemyMethod } from 'src/common/enum/alchemy.enum';

@Injectable()
export class UrlSigner {
  private readonly logger = new Logger(UrlSigner.name);
  constructor() {}

  apiSign(
    timestamp: string,
    method: string,
    requestUrl: string,
    body: string,
    secretKey: string,
  ): string {
    const content =
      timestamp +
      method.toUpperCase() +
      this.getPath(requestUrl) +
      this.getJsonBody(body);
    return crypto
      .createHmac('sha256', secretKey)
      .update(content, 'utf8')
      .digest('base64');
  }

  private getPath(requestUrl: string): string {
    const uri = new URL(requestUrl);
    const path = uri.pathname;
    const params = Array.from(uri.searchParams.entries());

    if (params.length === 0) return path;

    const sortedParams = [...params].sort(([a], [b]) => a.localeCompare(b));
    const queryString = sortedParams
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    return `${path}?${queryString}`;
  }

  private getJsonBody(body: string): string {
    let map: Record<string, any>;

    try {
      map = JSON.parse(body);
    } catch {
      map = {};
    }

    if (Object.keys(map).length === 0) return '';

    map = this.removeEmptyKeys(map);
    map = this.sortObject(map);

    return JSON.stringify(map);
  }

  private removeEmptyKeys(obj: Record<string, any>): Record<string, any> {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }

  private sortObject(obj: any): any {
    if (Array.isArray(obj)) {
      return this.sortList(obj);
    } else if (typeof obj === 'object') {
      return this.sortMap(obj);
    }
    return obj;
  }

  private sortMap(map: Record<string, any>): Record<string, any> {
    const sortedEntries = Object.entries(this.removeEmptyKeys(map)).sort(
      ([a], [b]) => a.localeCompare(b),
    );
    const result: Record<string, any> = {};
    for (const [key, value] of sortedEntries) {
      result[key] = typeof value === 'object' ? this.sortObject(value) : value;
    }
    return result;
  }

  private sortList(list: any[]): any[] {
    const numbers = list
      .filter((item) => typeof item === 'number' && !Number.isInteger(item))
      .sort((a, b) => a - b);
    const integers = list
      .filter((item) => Number.isInteger(item))
      .sort((a, b) => a - b);
    const strings = list.filter((item) => typeof item === 'string').sort();
    const objects = list
      .filter((item) => typeof item === 'object')
      .map((item) => this.sortObject(item));

    return [...integers, ...numbers, ...strings, ...objects];
  }

  async signPayload(
    timestamp: string,
    apiPayload: any,
    method: AlchemyMethod,
    requestUrl: string,
  ): Promise<string> {
    try {
      return this.apiSign(
        timestamp,
        method,
        requestUrl,
        JSON.stringify(apiPayload),
        process.env.ALCHEMY_PAY_SECRET as string,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `sign payload failed: ${error.message}`,
      );
    }
  }
}

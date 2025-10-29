import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VisitorBooking } from "../../visitor/entities/visitor.entity";
import { SubCarPark } from "../../sub-car-park/entities/sub-car-park.entity";
import { Tenancy } from "../../tenancy/entities/tenancy.entity";
import { FileUtils } from "../../common/utils/file.utils";
import { ParkingSpotStatus, VisitorBookingStatus } from "../../common/enums";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ScanStaySeederService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(VisitorBooking)
    private readonly visitorBookingRepository: Repository<VisitorBooking>,
    @InjectRepository(SubCarPark)
    private readonly subCarParkRepository: Repository<SubCarPark>,
    @InjectRepository(Tenancy)
    private readonly tenancyRepository: Repository<Tenancy>
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async run() {
    await this.seed();
  }

  private async seed() {
    this.logger.log("Starting Scan and Stay Data seed");

    // Get all sub car parks
    const subCarParks = await this.subCarParkRepository.find({
      where: { status: ParkingSpotStatus.ACTIVE },
    });

    if (subCarParks.length === 0) {
      this.logger.warn(
        "No active sub car parks found. Skipping scan and stay data seeding."
      );
      return;
    }

    // Get all tenancies
    const tenancies = await this.tenancyRepository.find();

    if (tenancies.length === 0) {
      this.logger.warn(
        "No active tenancies found. Skipping scan and stay data seeding."
      );
      return;
    }

    // Generate visitor bookings for each sub car park
    for (const subCarPark of subCarParks) {
      await this.generateVisitorBookingsForSubCarPark(subCarPark, tenancies);
    }

    this.logger.log("Scan and Stay Data seeding completed");
  }

  private async generateVisitorBookingsForSubCarPark(
    subCarPark: SubCarPark,
    tenancies: Tenancy[]
  ) {
    // Generate 5-20 visitor bookings per sub car park
    const numberOfBookings = Math.floor(Math.random() * 16) + 5;

    // Generate evenly distributed dates across the last 3 months
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const dates = this.generateDistributedDates(
      threeMonthsAgo,
      now,
      numberOfBookings
    );

    // Generate different createdAt dates for each booking
    const createdAtDates = this.generateDistributedCreatedAtDates(
      threeMonthsAgo,
      now,
      numberOfBookings
    );

    for (let i = 0; i < numberOfBookings; i++) {
      const tenancy = tenancies[Math.floor(Math.random() * tenancies.length)];
      const visitorBooking = await this.createVisitorBooking(
        subCarPark,
        tenancy,
        dates[i], // Use pre-generated distributed date
        createdAtDates[i] // Use pre-generated distributed createdAt date
      );

      if (visitorBooking) {
        this.logger.log(
          `Created visitor booking for sub car park: ${subCarPark.carParkName}`
        );
      }
    }
  }

  private async createVisitorBooking(
    subCarPark: SubCarPark,
    tenancy: Tenancy,
    startDate: Date,
    createdAt: Date
  ): Promise<VisitorBooking | null> {
    try {
      // Use the provided start date and add random duration
      const endDate = new Date(startDate.getTime() + this.getRandomDuration());

      // Generate random status with weighted distribution
      const status = this.getRandomStatus();

      // Generate realistic email and registration number
      const email = this.generateRandomEmail();
      const registrationNumber = this.generateRandomRegistrationNumber();

      // Use the provided createdAt date

      const visitorBooking = this.visitorBookingRepository.create({
        email,
        registrationNumber,
        tenancyId: tenancy.id,
        subCarParkId: subCarPark.id,
        startDate,
        endDate,
        status,
        token: uuidv4(),
        createdAt,
        updatedAt: createdAt, // Set updatedAt to same as createdAt initially
      });

      return await this.visitorBookingRepository.save(visitorBooking);
    } catch (error) {
      this.logger.error(
        `Error creating visitor booking for sub car park ${subCarPark.carParkName}: ${error.message}`
      );
      return null;
    }
  }

  private generateDistributedDates(
    start: Date,
    end: Date,
    count: number
  ): Date[] {
    const dates: Date[] = [];
    const totalDays = Math.floor(
      (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Ensure we don't try to generate more dates than available days
    const actualCount = Math.min(count, totalDays);

    // Calculate days between each booking to ensure they're on different dates
    const daysBetweenBookings = totalDays / actualCount;

    // Create evenly distributed dates across different days
    for (let i = 0; i < actualCount; i++) {
      // Calculate base day offset
      const dayOffset = i * daysBetweenBookings;

      // Add randomness but ensure we stay on different days
      // Add random offset between 0 and 0.8 days to keep bookings on different days
      const randomDayOffset = Math.random() * 0.8;
      const totalOffset = dayOffset + randomDayOffset;

      const date = new Date(
        start.getTime() + totalOffset * 24 * 60 * 60 * 1000
      );

      // Ensure date is within bounds
      if (date > end) {
        date.setTime(end.getTime() - 1000); // Set to just before end
      }

      // Add random time during the day (between 6 AM and 8 PM)
      const hours = 6 + Math.random() * 14; // 6 AM to 8 PM
      date.setHours(Math.floor(hours), Math.floor((hours % 1) * 60), 0, 0);

      dates.push(date);
    }

    // Sort dates to ensure chronological order
    dates.sort((a, b) => a.getTime() - b.getTime());

    return dates;
  }

  private generateDistributedCreatedAtDates(
    start: Date,
    end: Date,
    count: number
  ): Date[] {
    const dates: Date[] = [];
    const totalDays = Math.floor(
      (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Ensure we don't try to generate more dates than available days
    const actualCount = Math.min(count, totalDays);

    // Calculate days between each creation date to ensure they're on different dates
    const daysBetweenCreations = totalDays / actualCount;

    // Create evenly distributed creation dates across different days
    for (let i = 0; i < actualCount; i++) {
      // Calculate base day offset
      const dayOffset = i * daysBetweenCreations;

      // Add randomness but ensure we stay on different days
      // Add random offset between 0 and 0.8 days to keep creation dates on different days
      const randomDayOffset = Math.random() * 0.8;
      const totalOffset = dayOffset + randomDayOffset;

      const date = new Date(
        start.getTime() + totalOffset * 24 * 60 * 60 * 1000
      );

      // Ensure date is within bounds
      if (date > end) {
        date.setTime(end.getTime() - 1000); // Set to just before end
      }

      // Add random time during the day (between 6 AM and 11 PM)
      const hours = 6 + Math.random() * 17; // 6 AM to 11 PM
      date.setHours(Math.floor(hours), Math.floor((hours % 1) * 60), 0, 0);

      dates.push(date);
    }

    // Sort dates to ensure chronological order
    dates.sort((a, b) => a.getTime() - b.getTime());

    return dates;
  }

  private generateCreatedAtDate(startDate: Date): Date {
    // Generate createdAt date that's typically before the start date
    // This simulates realistic booking patterns where people book in advance

    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Create a date that's between 3 months ago and the start date
    // Most bookings are made 0-30 days before the actual parking date
    const maxDaysBefore = 30; // Maximum days before start date
    const minDaysBefore = 0; // Minimum days before start date (same day booking)

    // Calculate the earliest possible creation date
    const earliestCreation = new Date(
      startDate.getTime() - maxDaysBefore * 24 * 60 * 60 * 1000
    );

    // Ensure we don't go before our 3-month window
    const actualEarliest =
      earliestCreation < threeMonthsAgo ? threeMonthsAgo : earliestCreation;

    // Generate random creation date between actualEarliest and startDate
    const daysBefore =
      Math.random() * (maxDaysBefore - minDaysBefore) + minDaysBefore;
    const createdAt = new Date(
      startDate.getTime() - daysBefore * 24 * 60 * 60 * 1000
    );

    // Ensure createdAt is not before our earliest possible date
    if (createdAt < actualEarliest) {
      return actualEarliest;
    }

    // Add random time during the day (between 6 AM and 11 PM)
    const hours = 6 + Math.random() * 17; // 6 AM to 11 PM
    createdAt.setHours(Math.floor(hours), Math.floor((hours % 1) * 60), 0, 0);

    return createdAt;
  }

  private getRandomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  private getRandomDuration(): number {
    // Duration between 1 hour and 8 hours (in milliseconds)
    const minHours = 1;
    const maxHours = 8;
    const hours = minHours + Math.random() * (maxHours - minHours);
    return hours * 60 * 60 * 1000;
  }

  private getRandomStatus(): VisitorBookingStatus {
    const statuses = [
      VisitorBookingStatus.ACTIVE,
      VisitorBookingStatus.ACTIVE,
      VisitorBookingStatus.ACTIVE, // Higher weight for active
      VisitorBookingStatus.CHECKOUT,
      VisitorBookingStatus.CHECKOUT,
      VisitorBookingStatus.PENDING,
      VisitorBookingStatus.UNAUTHENTICATED,
    ];

    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateRandomEmail(): string {
    const domains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "company.com",
    ];
    const names = [
      "john.doe",
      "jane.smith",
      "mike.johnson",
      "sarah.wilson",
      "david.brown",
      "lisa.garcia",
      "robert.miller",
      "jennifer.davis",
      "william.rodriguez",
      "mary.martinez",
      "james.hernandez",
      "patricia.lopez",
      "michael.gonzalez",
      "barbara.wilson",
      "richard.anderson",
      "susan.thomas",
      "joseph.taylor",
      "jessica.moore",
      "thomas.jackson",
      "sarah.martin",
    ];

    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const randomNumber = Math.floor(Math.random() * 1000);

    return `${name}${randomNumber}@${domain}`;
  }

  private generateRandomRegistrationNumber(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let registration = "";

    // Generate 1-3 letters
    const letterCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < letterCount; i++) {
      registration += letters[Math.floor(Math.random() * letters.length)];
    }

    // Generate 2-4 numbers
    const numberCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numberCount; i++) {
      registration += numbers[Math.floor(Math.random() * numbers.length)];
    }

    // Sometimes add more letters at the end
    if (Math.random() > 0.5) {
      registration += letters[Math.floor(Math.random() * letters.length)];
    }

    return registration;
  }
}

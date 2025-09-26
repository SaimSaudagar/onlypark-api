import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource, LessThan, LessThanOrEqual } from 'typeorm';
import { InfringementStatus, BookingStatus } from '../../common/enums';
import { Infringement } from '../../infringement/entities/infringement.entity';
import { VisitorBooking } from '../../visitor-booking/entities/visitor-booking.entity';
import { OutstandingRegistration } from '../../outstanding-registration/entities/outstanding-registration.entity';
import { EmailNotificationService } from '../../common/services/email/email-notification.service';
import { SendEmailRequest } from '../../common/services/email/email-notification.dto';
import { CustomException } from '../../common/exceptions/custom.exception';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);
  // private _infringementReminderRunning = false;
  // private _bookingExpiryRunning = false;
  // private _outstandingCleanupRunning = false;
  private _visitorBookingExpiryRunning = false;

  constructor(
    protected readonly datasource: DataSource,
    private readonly emailNotificationService: EmailNotificationService,
  ) { }

  // @Cron('0 9 * * *') // Every day at 9 AM
  // async runInfringementReminderJob() {
  //     if (this._infringementReminderRunning) {
  //         this.logger.log('Infringement reminder job already running');
  //         return;
  //     }

  //     this.logger.log('Running infringement reminder job');
  //     this._infringementReminderRunning = true;

  //     try {
  //         // Find pending infringements that are due in 7 days or overdue
  //         const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  //         const pendingInfringements = await this.datasource
  //             .getRepository(Infringement)
  //             .find({
  //                 where: {
  //                     status: InfringementStatus.PENDING,
  //                     dueDate: LessThanOrEqual(sevenDaysFromNow),
  //                 },
  //                 relations: ['infringementCarPark', 'reason', 'penalty'],
  //             });

  //         this.logger.log(`Found ${pendingInfringements.length} infringements to send reminders for`);

  //         for (const infringement of pendingInfringements) {
  //             try {
  //                 const emailRequest: SendEmailRequest = {
  //                     to: infringement.registrationNo, // This would need to be mapped to actual email
  //                     subject: 'Infringement Reminder Notice',
  //                     body: `
  //           <h2>Infringement Reminder Notice</h2>
  //           <p>Ticket Number: ${infringement.ticketNumber}</p>
  //           <p>Due Date: ${infringement.dueDate.toLocaleDateString()}</p>
  //           <p>Amount: ${infringement.penalty?.penalty || 'N/A'}</p>
  //           <p>Reason: ${infringement.reason?.reason || 'N/A'}</p>
  //           <p>Car Park: ${infringement.infringementCarPark?.name || 'N/A'}</p>
  //           <p>Please pay your infringement notice before the due date to avoid additional penalties.</p>
  //         `,
  //                 };
  //                 await this.emailNotificationService.send(emailRequest);
  //             } catch (error) {
  //                 this.logger.error(`Failed to send reminder for infringement ${infringement.ticketNumber}:`, error);
  //             }
  //         }

  //         this.logger.log('Infringement reminder job completed');
  //     } catch (error) {
  //         this.logger.error('Infringement reminder job failed:', error);
  //         throw error;
  //     } finally {
  //         this._infringementReminderRunning = false;
  //     }
  // }

  // @Cron('*/5 * * * *') // Every 5 minutes
  // async runBookingExpiryJob() {
  //     if (this._bookingExpiryRunning) {
  //         this.logger.log('Booking expiry job already running');
  //         return;
  //     }

  //     this.logger.log('Running booking expiry job');
  //     this._bookingExpiryRunning = true;

  //     try {
  //         // Find active bookings that have expired
  //         const now = new Date();
  //         const expiredBookings = await this.datasource
  //             .getRepository(VisitorBooking)
  //             .find({
  //                 where: {
  //                     status: BookingStatus.ACTIVE,
  //                     endDate: LessThan(now),
  //                 },
  //                 relations: ['tenancy', 'subCarPark'],
  //             });

  //         this.logger.log(`Found ${expiredBookings.length} expired bookings to update`);

  //         for (const booking of expiredBookings) {
  //             try {
  //                 // Update booking status to expired
  //                 await this.datasource
  //                     .getRepository(VisitorBooking)
  //                     .update(booking.id, { status: BookingStatus.EXPIRED });

  //                 // Send expiry notification
  //                 const emailRequest: SendEmailRequest = {
  //                     to: booking.email,
  //                     subject: 'Booking Expired Notice',
  //                     body: `
  //           <h2>Booking Expired Notice</h2>
  //           <p>Your parking booking has expired.</p>
  //           <p>Registration Number: ${booking.registrationNumber}</p>
  //           <p>End Date: ${booking.endDate.toLocaleDateString()}</p>
  //           <p>Car Park: ${booking.subCarPark?.name || 'N/A'}</p>
  //           <p>Tenancy: ${booking.tenancy?.tenantName || 'N/A'}</p>
  //           <p>Please make a new booking if you need to continue parking.</p>
  //         `,
  //                 };
  //                 await this.emailNotificationService.send(emailRequest);

  //                 this.logger.log(`Updated booking ${booking.id} to expired status`);
  //             } catch (error) {
  //                 this.logger.error(`Failed to update booking ${booking.id}:`, error);
  //             }
  //         }

  //         this.logger.log('Booking expiry job completed');
  //     } catch (error) {
  //         this.logger.error('Booking expiry job failed:', error);
  //         throw error;
  //     } finally {
  //         this._bookingExpiryRunning = false;
  //     }
  // }

  // @Cron('0 2 * * *') // Every day at 2 AM
  // async runOutstandingRegistrationCleanupJob() {
  //     if (this._outstandingCleanupRunning) {
  //         this.logger.log('Outstanding registration cleanup job already running');
  //         return;
  //     }

  //     this.logger.log('Running outstanding registration cleanup job');
  //     this._outstandingCleanupRunning = true;

  //     try {
  //         // Find outstanding registrations older than 30 days
  //         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  //         const oldOutstandingRegistrations = await this.datasource
  //             .getRepository(OutstandingRegistration)
  //             .find({
  //                 where: {
  //                     createdAt: LessThan(thirtyDaysAgo),
  //                 },
  //             });

  //         this.logger.log(`Found ${oldOutstandingRegistrations.length} old outstanding registrations to cleanup`);

  //         if (oldOutstandingRegistrations.length > 0) {
  //             // Delete old outstanding registrations
  //             await this.datasource
  //                 .getRepository(OutstandingRegistration)
  //                 .delete({
  //                     createdAt: LessThan(thirtyDaysAgo),
  //                 });

  //             this.logger.log(`Cleaned up ${oldOutstandingRegistrations.length} old outstanding registrations`);
  //         }

  //         this.logger.log('Outstanding registration cleanup job completed');
  //     } catch (error) {
  //         this.logger.error('Outstanding registration cleanup job failed:', error);
  //         throw error;
  //     } finally {
  //         this._outstandingCleanupRunning = false;
  //     }
  // }

  // @Cron('0 0 * * 0') // Every Sunday at midnight
  // async runWeeklyReportJob() {
  //     this.logger.log('Running weekly report job');

  //     try {
  //         // Get statistics for the past week
  //         const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  //         const [
  //             totalBookings,
  //             totalInfringements,
  //             totalRevenue,
  //             activeCarParks,
  //         ] = await Promise.all([
  //             // Count bookings in the past week
  //             this.datasource
  //                 .getRepository(VisitorBooking)
  //                 .count({
  //                     where: {
  //                         createdAt: LessThanOrEqual(oneWeekAgo),
  //                     },
  //                 }),

  //             // Count infringements in the past week
  //             this.datasource
  //                 .getRepository(Infringement)
  //                 .count({
  //                     where: {
  //                         createdAt: LessThanOrEqual(oneWeekAgo),
  //                     },
  //                 }),

  //             // Calculate total revenue from paid infringements
  //             this.datasource
  //                 .getRepository(Infringement)
  //                 .createQueryBuilder('infringement')
  //                 .leftJoin('infringement.penalty', 'penalty')
  //                 .where('infringement.status = :status', { status: InfringementStatus.PAID })
  //                 .andWhere('infringement.createdAt >= :date', { date: oneWeekAgo })
  //                 .select('SUM(CAST(penalty.penalty AS DECIMAL))', 'total')
  //                 .getRawOne(),

  //             // Count active car parks
  //             this.datasource
  //                 .getRepository(VisitorBooking)
  //                 .createQueryBuilder('booking')
  //                 .leftJoin('booking.subCarPark', 'subCarPark')
  //                 .where('booking.createdAt >= :date', { date: oneWeekAgo })
  //                 .select('COUNT(DISTINCT subCarPark.id)', 'count')
  //                 .getRawOne(),
  //         ]);

  //         const reportData = {
  //             period: 'Weekly Report',
  //             startDate: oneWeekAgo,
  //             endDate: new Date(),
  //             statistics: {
  //                 totalBookings,
  //                 totalInfringements,
  //                 totalRevenue: totalRevenue?.total || 0,
  //                 activeCarParks: activeCarParks?.count || 0,
  //             },
  //         };

  //         // Send report to admin (this would need to be configured with admin email)
  //         const emailRequest: SendEmailRequest = {
  //             to: 'admin@onlypark.com', // This should be configurable
  //             subject: 'Weekly Parking Management Report',
  //             body: `
  //       <h2>Weekly Parking Management Report</h2>
  //       <p><strong>Period:</strong> ${reportData.period}</p>
  //       <p><strong>Start Date:</strong> ${reportData.startDate.toLocaleDateString()}</p>
  //       <p><strong>End Date:</strong> ${reportData.endDate.toLocaleDateString()}</p>
  //       <h3>Statistics:</h3>
  //       <ul>
  //         <li>Total Bookings: ${reportData.statistics.totalBookings}</li>
  //         <li>Total Infringements: ${reportData.statistics.totalInfringements}</li>
  //         <li>Total Revenue: $${reportData.statistics.totalRevenue}</li>
  //         <li>Active Car Parks: ${reportData.statistics.activeCarParks}</li>
  //       </ul>
  //     `,
  //         };
  //         await this.emailNotificationService.send(emailRequest);

  //         this.logger.log('Weekly report job completed');
  //     } catch (error) {
  //         this.logger.error('Weekly report job failed:', error);
  //         throw error;
  //     }
  // }

  // @Cron('* * * * *') // Every minute
  // async runVisitorBookingExpiryJob() {
  //   if (this._visitorBookingExpiryRunning) {
  //     this.logger.log('Visitor booking expiry job already running');
  //     return;
  //   }

  //   this.logger.log('Running visitor booking expiry job');
  //   this._visitorBookingExpiryRunning = true;

  //   try {
  //     // Find active visitor bookings that have expired
  //     const now = new Date();
  //     const expiredBookings = await this.datasource
  //       .getRepository(VisitorBooking)
  //       .find({
  //         where: {
  //           status: BookingStatus.ACTIVE,
  //           endDate: LessThan(now),
  //         },
  //         relations: {
  //           tenancy: true,
  //           subCarPark: true,
  //         },
  //       });

  //     this.logger.log(`Found ${expiredBookings.length} expired visitor bookings to update`);

  //     for (const booking of expiredBookings) {
  //       try {
  //         // Update booking status to expired
  //         await this.datasource
  //           .getRepository(VisitorBooking)
  //           .update(booking.id, { status: BookingStatus.PENDING });


  //         this.logger.log(`Updated visitor booking ${booking.id} to expired status`);
  //       } catch (error) {
  //         this.logger.error(`Failed to update visitor booking ${booking.id}:`, error);
  //       }
  //     }

  //     this.logger.log('Visitor booking expiry job completed');
  //   } catch (error) {
  //     this.logger.error('Visitor booking expiry job failed:', error);
  //     throw new CustomException(
  //       'VISITOR_BOOKING_EXPIRY_JOB_FAILED',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       { error: error.message }
  //     );
  //   } finally {
  //     this._visitorBookingExpiryRunning = false;
  //   }
  // }
}

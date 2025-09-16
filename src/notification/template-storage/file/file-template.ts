import { TemplateKeys } from '../../../common/constants/template-keys';
import {
    FileType,
    TemplateType,
} from '../template-storage.enum';

export class FileTemplate {
    public static readonly TEST_EMAIL = {
        key: TemplateKeys.TEST_EMAIL,
        fileName: 'test-email.html',
        fileType: FileType.HTML,
        title: 'OnlyPark Test Email',
        body: '',
        type: TemplateType.EMAIL,
    };

    public static readonly USER_REGISTRATION = {
        key: TemplateKeys.USER_REGISTRATION,
        fileName: 'user-registration.html',
        fileType: FileType.HTML,
        title: 'Welcome to OnlyPark - Complete Your Registration',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly VISITOR_BOOKING_CONFIRMATION = {
        key: TemplateKeys.VISITOR_BOOKING_CONFIRMATION,
        fileName: 'visitor-booking-confirmation.html',
        fileType: FileType.HTML,
        title: 'Visitor Parking Booking Confirmation - OnlyPark',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly WELCOME_ADMIN = {
        key: TemplateKeys.WELCOME_ADMIN,
        fileName: 'welcome-admin.html',
        fileType: FileType.HTML,
        title: 'Welcome to OnlyPark Admin Portal',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly WELCOME_CARPARK_MANAGER = {
        key: TemplateKeys.WELCOME_CARPARK_MANAGER,
        fileName: 'welcome-carpark-manager.html',
        fileType: FileType.HTML,
        title: 'Welcome to OnlyPark - Car Park Manager',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.CARPARK_MANAGER_LAYOUT,
    };

    public static readonly WELCOME_PATROL_OFFICER = {
        key: TemplateKeys.WELCOME_PATROL_OFFICER,
        fileName: 'welcome-patrol-officer.html',
        fileType: FileType.HTML,
        title: 'Welcome to OnlyPark - Patrol Officer',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.PATROL_OFFICER_LAYOUT,
    };

    public static readonly PASSWORD_RESET = {
        key: TemplateKeys.PASSWORD_RESET,
        fileName: 'password-reset.html',
        fileType: FileType.HTML,
        title: 'Reset Your OnlyPark Password',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly NOTIFICATION_GENERAL = {
        key: TemplateKeys.NOTIFICATION_GENERAL,
        fileName: 'notification-general.html',
        fileType: FileType.HTML,
        title: 'OnlyPark Notification',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly NOTIFICATION_ALERT = {
        key: TemplateKeys.NOTIFICATION_ALERT,
        fileName: 'notification-alert.html',
        fileType: FileType.HTML,
        title: 'OnlyPark Alert',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly SYSTEM_MAINTENANCE = {
        key: TemplateKeys.SYSTEM_MAINTENANCE,
        fileName: 'system-maintenance.html',
        fileType: FileType.HTML,
        title: 'OnlyPark System Maintenance Notice',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    public static readonly SYSTEM_UPDATE = {
        key: TemplateKeys.SYSTEM_UPDATE,
        fileName: 'system-update.html',
        fileType: FileType.HTML,
        title: 'OnlyPark System Update',
        body: '',
        type: TemplateType.EMAIL,
        layout: TemplateKeys.ADMIN_LAYOUT,
    };

    // Layout Templates
    public static readonly ADMIN_LAYOUT = {
        key: TemplateKeys.ADMIN_LAYOUT,
        fileName: 'admin-layout.html',
        fileType: FileType.HTML,
        title: 'OnlyPark Admin Layout',
        body: '',
        type: TemplateType.EMAIL,
    };

    public static readonly CARPARK_MANAGER_LAYOUT = {
        key: TemplateKeys.CARPARK_MANAGER_LAYOUT,
        fileName: 'carpark-manager-layout.html',
        fileType: FileType.HTML,
        title: 'OnlyPark Car Park Manager Layout',
        body: '',
        type: TemplateType.EMAIL,
    };

    public static readonly PATROL_OFFICER_LAYOUT = {
        key: TemplateKeys.PATROL_OFFICER_LAYOUT,
        fileName: 'patrol-officer-layout.html',
        fileType: FileType.HTML,
        title: 'OnlyPark Patrol Officer Layout',
        body: '',
        type: TemplateType.EMAIL,
    };

    public static get(key: string) {
        return FileTemplate[key];
    }
}

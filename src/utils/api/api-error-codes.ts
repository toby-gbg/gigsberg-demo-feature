export const AppErrorKey = {
    // Status: 500 | Internal Server Error
    INTERNAL_SERVER_ERROR: 'internal_server_error',
    // Status: 422 | Validation failed
    VALIDATION_ERROR: 'validation_error',
    // Status: 404 | Resource not found
    NOT_FOUND: 'not_found',
    // Status: 401 | Unauthorized
    UNAUTHORIZED: 'unauthorized',
    // Status: 403 | Forbidden
    FORBIDDEN: 'forbidden',
    // Status: 400 | Bad Request
    BAD_REQUEST: 'bad_request',
    // Status: 409 | Conflict
    CONFLICT: 'conflict',
    // Status: 403 | User is blocked
    USER_IS_BLOCKED: 'user_is_blocked',
    // Status: 409 | Listing is currently locked
    LISTING_LOCKED: 'listing_locked',
    // Status: 403 | Billing address not allowed
    BILLING_ADDRESS_BLOCKED: 'billing_address_blocked',
    // Status: 403 | Event is not open for sale
    EVENT_IS_NOT_AVAILABLE: 'event_is_not_available',
    // Status: 409 | Event date is not valid
    EVENT_DATE_INVALID: 'event_date_invalid',
    // Status: 400 | Invalid coupon
    INVALID_COUPON_CODE: 'invalid_coupon_code',
    // Status: 400 | Coupon has expired
    EXPIRED_COUPON_CODE: 'expired_coupon_code',
    // Status: 400 | Coupon is not yet active
    INACTIVE_COUPON_CODE: 'inactive_coupon_code',
    // Status: 400 | Coupon usage limit reached
    COUPON_USAGE_LIMIT_REACHED: 'coupon_usage_limit_reached',
    // Status: 400 | Coupon amount is higher than the total price
    COUPON_AMOUNT_TOO_HIGH: 'coupon_amount_too_high',
    // Status: 406 | invalid_quantity
    INVALID_QUANTITY: 'invalid_quantity',
    // Status: 409 | This ticket is no longer available
    NO_TICKETS_AVAILABLE_409: 'no_tickets_available',
    // Status: 410 | This may be sent as HTTP 410 when the listing is gone (deleted/inactive) at payment-intent time
    NO_TICKETS_AVAILABLE_410: 'no_tickets_available',
    // Status: 409 | Email is already in use
    EMAIL_ALREADY_IN_USE: 'email_already_in_use',
    // Status: 404 | Email not found
    EMAIL_NOT_FOUND: 'email_not_found',
    // Status: 401 | Invalid email or password
    INVALID_EMAIL_OR_PASSWORD: 'invalid_email_or_password',
    // Status: 404 | OTP not found
    INVALID_OTP: 'invalid_otp',
    // Status: 400 | Current password is incorrect
    INCORRECT_CURRENT_PASSWORD: 'incorrect_current_password',
    // Status: 400 | New password cannot be the same as the old password
    NEW_PASSWORD_SAME_AS_OLD: 'new_password_same_as_old',
    // Status: 404 | User not found
    USER_NOT_FOUND: 'user_not_found',
    // Status: 404 | Address not found
    ADDRESS_NOT_FOUND: 'address_not_found',
    // Status: 400 | Address not created
    ADDRESS_NOT_CREATED: 'address_not_created',
    // Status: 400 | Address not deleted
    ADDRESS_NOT_DELETED: 'address_not_deleted',
    // Status: 400 | Cannot delete the only address
    CANNOT_DELETE_ONLY_ADDRESS: 'cannot_delete_only_address',
    // Status: 400 | PaymentMethods not found
    PAYMENT_METHOD_NOT_FOUND: 'payment_method_not_found',
    // Status: 400 | PaymentMethod not created
    PAYMENT_METHOD_NOT_CREATED: 'payment_method_not_created',
    // Status: 404 | Order not found
    ORDER_NOT_FOUND: 'order_not_found',
    // Status: 403 | You are not allowed to access this order
    ORDER_ACCESS_DENIED: 'order_access_denied',
    // Status: 400 | Order is not free
    ORDER_NOT_FREE: 'order_not_free',
    // Status: 404 | Listing not found
    LISTING_NOT_FOUND: 'listing_not_found',
    // Status: 403 | This listing has sold tickets. Please contact customer service at Selling@gigsberg.com for assistance.
    LISTING_HAS_SOLD_TICKETS: 'listing_has_sold_tickets',
    // Status: 403 | This listing has pending orders. Please wait a few minutes and try again or contact customer service at Selling@gigsberg.com for assistance.
    LISTING_HAS_PENDING_ORDERS: 'listing_has_pending_orders',
    // Status: 404 | Event not found
    EVENT_NOT_FOUND: 'event_not_found',
    // Status: 400 | Invalid eventId parameter
    INVALID_EVENT_ID: 'invalid_event_id',
    // Status: 403 | This event is restricted to a primary seller only
    EVENT_PRIMARY_SELLER_ONLY: 'event_primary_seller_only',
    // Status: 403 | You are not allowed to list this event
    NOT_ALLOWED_TO_LIST_EVENT: 'not_allowed_to_list_event',
    // Status: 422 | Ticket type is not allowed for this event
    TICKET_TYPE_NOT_ALLOWED: 'ticket_type_not_allowed',
    // Status: 401 | User must be logged in
    USER_MUST_BE_LOGGED_IN: 'user_must_be_logged_in',
    // Status: 403 | Forbidden: Invalid token
    INVALID_EXTRA_INFO_TOKEN: 'invalid_extra_info_token',
    // Status: 403 | We do not allow to sell this ticket type for this event at this time.
    LAST_MINUTE_TICKET_TYPE_RESTRICTED: 'last_minute_ticket_type_restricted',
    // Status: 401 | Authentication required for this coupon
    AUTHENTICATION_REQUIRED: 'authentication_required',
    // Status: 409 | Order is not in LEAD status
    ORDER_NOT_IN_LEAD_STATUS: 'order_not_in_lead_status',
    // Status: 400 | Invalid address ID parameters
    INVALID_ADDRESS_ID: 'invalid_address_id',
    // Status: 400 | Invalid or missing affiliateId parameter
    INVALID_AFFILIATE_ID: 'invalid_affiliate_id',
    // Status: 404 | Event guest data not found
    EVENT_GUEST_DATA_NOT_FOUND: 'event_guest_data_not_found',
    // Status: 404 | Invalid feedback token
    INVALID_FEEDBACK_TOKEN: 'invalid_feedback_token',
    // Status: 404 | No ticket files found
    NO_TICKET_FILES: 'no_ticket_files',
    // Status: 404 | Uploaded e-ticket file not found
    UPLOADED_TICKET_NOT_FOUND: 'uploaded_ticket_not_found',
    // Status: 404 | Mobile link not found
    MOBILE_LINK_NOT_FOUND: 'mobile_link_not_found',
    // Status: 400 | Unsupported ticket type for bulk delete
    UNSUPPORTED_TICKET_TYPE: 'unsupported_ticket_type',
    // Status: 400 | Insufficient balance for zero_pay
    INSUFFICIENT_BALANCE: 'insufficient_balance',
    // Status: 400 | Payment provider should be ZERO_PAY
    USE_ZERO_PAY: 'use_zero_pay',
    // Status: 403 | You are not allowed to update this listing
    LISTING_ACCESS_DENIED: 'listing_access_denied',
    // Status: 404 | Lead not found
    LEAD_NOT_FOUND: 'lead_not_found',
    // Status: 409 | Listing is currently not locked
    LISTING_NOT_LOCKED: 'listing_not_locked',
    // Status: 400 | Invalid condition parameter
    INVALID_GUEST_CONDITION: 'invalid_guest_condition',
    // Status: 500 | Error saving files
    TICKET_FILES_SAVE_FAILED: 'ticket_files_save_failed',
    // Status: 422 | Upload exceeds order quantity
    UPLOAD_QUANTITY_EXCEEDED: 'upload_quantity_exceeded',
    // Status: 422 | Presented quantity cannot exceed listing quantity
    PRESENTED_QUANTITY_EXCEEDED: 'presented_quantity_exceeded',
    // Status: 422 | Invalid file type
    INVALID_FILE_TYPE: 'invalid_file_type',
    // Status: 422 | Image exceeds the maximum allowed size
    IMAGE_TOO_LARGE: 'image_too_large',
    // Status: 422 | Ticket upload is not allowed after the event has taken place
    TICKET_UPLOAD_NOT_ALLOWED: 'ticket_upload_not_allowed',
    // Status: 422 | Mobile transfer is only supported for mobile ticket orders
    MOBILE_TRANSFER_NOT_SUPPORTED: 'mobile_transfer_not_supported',
    // Status: 422 | Extra information count must equal the order quantity
    EXTRA_INFO_COUNT_MISMATCH: 'extra_info_count_mismatch',
    // Status: 422 | Guest data submission is not supported for this order
    GUEST_DATA_NOT_SUPPORTED: 'guest_data_not_supported',
    // Status: 422 | No guest data is required for this event
    GUEST_DATA_NOT_REQUIRED: 'guest_data_not_required',
    // Status: 422 | Guest count does not match the order
    GUEST_COUNT_MISMATCH: 'guest_count_mismatch',
    // Status: 400 | Guest data could not be submitted
    GUEST_DATA_SUBMIT_FAILED: 'guest_data_submit_failed',
    // Status: 422 | Seat end must equal seat start plus quantity
    SEAT_RANGE_INVALID: 'seat_range_invalid',
    // Status: 422 | Listing quantity is too high
    LISTING_QUANTITY_EXCEEDED: 'listing_quantity_exceeded',
    // Status: 422 | Listing quantity is invalid
    LISTING_QUANTITY_INVALID: 'listing_quantity_invalid',
    // Status: 422 | Available quantity cannot be negative
    AVAILABLE_QUANTITY_INVALID: 'available_quantity_invalid',
    // Status: 401 | Invalid access token
    INVALID_ACCESS_TOKEN: 'invalid_access_token',
    // Status: 500 | Failed to retrieve metadata
    LISTING_METADATA_UNAVAILABLE: 'listing_metadata_unavailable',
    // Status: 404 | type with nameUrl not found
    TYPE_NOT_FOUND: 'type_not_found',
    // Status: 404 | subtype or tour with nameUrl not found
    SUBTYPE_OR_TOUR_NOT_FOUND: 'subtype_or_tour_not_found',
    // Status: 400 | Subtype invalid
    SUBTYPE_URL_MISMATCH: 'subtype_url_mismatch',
    // Status: 400 | Type invalid
    TYPE_URL_MISMATCH: 'type_url_mismatch',
    // Status: 400 | Performer invalid
    PERFORMER_URL_MISMATCH: 'performer_url_mismatch',
    // Status: 400 | nameUrl, subtypeNameUrl and typeNameUrl are required
    METADATA_QUERY_REQUIRED: 'metadata_query_required',
    // Status: 404 | Tour not found
    TOUR_NOT_FOUND: 'tour_not_found',
    // Status: 404 | Performer not found
    PERFORMER_NOT_FOUND: 'performer_not_found',
    // Status: 422 | Quantity and split type must match
    ERROR_CANNOT_SPLIT_PAIR: 'error_cannot_split_pair',
} as const;

export type TAppErrorKey = (typeof AppErrorKey)[keyof typeof AppErrorKey];

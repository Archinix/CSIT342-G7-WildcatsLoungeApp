# Wildcats Lounge Backend API Endpoints

Base URL: set this to your deployed backend host, then append the paths below.

Important: endpoints marked as JWT-required must include `Authorization: Bearer <token>` or they will return `401 Unauthorized`.

## Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check for backend and database |
| POST | `/auth/login` | Authenticate user and receive token |
| POST | `/auth/logout` | Logout response endpoint |
| POST | `/auth/register` | Create a new user account |
| GET | `/auth/users/{id}` | Get user profile by ID |
| GET | `/auth/users/email/{email}` | Get user profile by email |
| PUT | `/auth/users/{id}` | Update user profile |
| POST | `/auth/users/{id}/change-password` | Change password with current password |
| POST | `/auth/users/{id}/upload-photo` | Upload profile photo |
| GET | `/auth/users/{id}/photo` | Fetch profile photo |
| GET | `/auth/login-users/{email}` | Fetch login user by email |
| PUT | `/auth/users/{id}/last-login` | Update last login timestamp |
| POST | `/auth/forgot-password` | Request password reset email |
| POST | `/auth/reset-password` | Reset password using token |
| POST | `/auth/password/forgot` | Alternate forgot-password endpoint |
| POST | `/auth/password/reset` | Alternate reset-password endpoint |
| GET | `/auth/password/validate-token/{token}` | Validate reset token |
| GET | `/products` | List products, optional `?search=` |
| GET | `/products/{id}` | Get product details by ID |

## JWT-required endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/cart` | Get current user's cart |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/{id}` | Update cart item quantity |
| DELETE | `/cart/items/{id}` | Remove cart item |
| POST | `/orders` | Place an order |
| GET | `/orders` | Get authenticated user's orders |
| GET | `/orders/active` | Get active orders |
| GET | `/loyalty/status` | Get loyalty status |
| POST | `/loyalty/redeem` | Redeem loyalty points |
| POST | `/loyalty/coupons` | Generate coupon from points |
| GET | `/loyalty/vouchers/my-vouchers` | Get user's vouchers |
| PUT | `/loyalty/coupons/{code}/apply` | Apply coupon code |

## Role-restricted endpoints

| Method | Path | Required role |
| --- | --- | --- |
| POST | `/admin/products` | `ADMIN` or `SUPERADMIN` |
| PATCH | `/admin/products/{id}` | `ADMIN` or `SUPERADMIN` |
| POST | `/admin/superadmin/accounts/admins` | `SUPERADMIN` |
| GET | `/orders/staff/queue` | `STAFF`, `ADMIN`, or `SUPERADMIN` |
| PATCH | `/orders/staff/orders/{id}` | `STAFF`, `ADMIN`, or `SUPERADMIN` |

## Notes for the mobile app

1. Call `POST /auth/login` first and save the returned JWT.
2. Send the token on every protected request using the `Authorization` header.
3. Use the exact format `Authorization: Bearer <token>`.
4. If you still get `401`, the token may be missing, expired, or sent to an endpoint that is not public.
5. The `GET /health` endpoint can be used to confirm the backend is reachable before testing auth.

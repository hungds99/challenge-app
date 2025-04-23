# Challenge Hub

A web application platform for creating and participating in coding challenges, built with Next.js and Supabase.

## Features

- User authentication and role-based access control
- Challenge creation and management
- Challenge submission and review system
- Leaderboard and user rankings
- Admin review system

## Prerequisites

- Node.js 20.x or later
- npm (comes with Node.js)
- Supabase account

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd challenge-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database with the following tables:

- Follow file `schema.sql` to create the necessary tables in your Supabase database.
- Run the SQL commands in the Supabase SQL editor to set up the database schema.
- Ensure you have the necessary policies and roles set up for user authentication and challenge management.

## User Roles

- **Admin**: Full platform management capabilities, can review and publish challenges
- **Contributor**: Can create and submit challenges for admin review
- **Basic User**: Can access and participate in published challenges

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

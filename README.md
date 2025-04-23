# Challenge Platform

A web application platform for creating and participating in coding challenges, built with Next.js and Supabase.

## Features

- User authentication and role-based access control
- Challenge creation and management
- Challenge submission and review system
- Leaderboard and user rankings
- Time-limited challenges
- Admin review system

## Prerequisites

- Node.js 18.x or later
- npm or yarn
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

### Users Table

```sql
create table users (
  id uuid references auth.users on delete cascade,
  email text,
  username text,
  role text check (role in ('admin', 'contributor', 'user')),
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);
```

### Challenges Table

```sql
create table challenges (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  rules text not null,
  category text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  status text check (status in ('draft', 'pending', 'published')),
  created_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  expected_answer text,
  time_limit integer
);
```

### Submissions Table

```sql
create table submissions (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references challenges(id),
  user_id uuid references users(id),
  answer text not null,
  status text check (status in ('pending', 'approved', 'rejected')),
  score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

5. Create a function to increment user points:

```sql
create or replace function increment_user_points(user_id uuid, points integer)
returns void as $$
begin
  update users
  set points = points + $2
  where id = $1;
end;
$$ language plpgsql security definer;
```

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

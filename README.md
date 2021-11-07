# Villekulla Booking

> Run an opinionated booking tool on NodeJS and SQLite.

<a href="https://villekulla-nma.github.io/monitor-booking/history/booking"><img alt="7-day uptime 100.00%" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fvillekulla-nma%2Fmonitor-booking%2FHEAD%2Fapi%2Fbooking%2Fuptime-week.json"></a>

## Installation

### Get NodeJS

Download the NodeJS version manager [`nvm`](https://github.com/nvm-sh/nvm#readme), then run the
following command to install the required NodeJS version:

```sh
nvm install
```

If you already have the required NodeJS version installed on your machine, activate it by running
the following command:

```sh
nvm use
```

### Install dependencies

Install the dependencies for the complete project with the following command:

```sh
npm install
```

This will install the NodeJS packages for the base project, as well as for the `server/` and the
`client/` packages.

## Configuration

Before running the project locally you need to set a few configuration values. Therefor rename the
`.env.example` to `.env` and add the missing values.

```sh
mv .env.example .env
```

### `JWT_SECRET`

For the encryption of the session cookie value the `JWT_SECRET` needs to be set to a random
alphanumeric string with at least 32 characters. Run the following command to get a nice random
string:

```sh
node -e "process.stdout.write(crypto.randomBytes(32).toString('hex').slice(0, 32))"
```

### `SALT`

For the salting of the user passwords a salt string is required. To generate a random salt, run the
following command:

```sh
npm run gen-salt
```

### `SENDER_EMAIL_ADDRESS`

The booking tool uses [SendGrid](https://sendgrid.com/) to send emails. The value of
`SENDER_EMAIL_ADDRESS` will be the sender address of every email sent by the booking tool via
SendGrid.

### `SENDGRID_API_KEY`

For emails to be sent successfully via SendGrid a SendGrid API key is required. Log into their
dashboard to obtain an API token.

### `VILLEKULLA_ADMIN_0_*`

To create an initial admin user set all the values prefixed with `VILLEKULLA_ADMIN_0_`.

The user ID needs to be an alphanumeric 9-character string. To obtain a value, run the following
command:

```sh
npm run create-id
```

To create a default password run the following command:

```sh
SALT='<previously generated salt>' npm run create-default-password
```

You have to pass in the previously generated salt via the env variable `SALT`. Put this value into
single quotes. Since the salt contains `$`-signs your Shell might interpret parts of the salt as
variables otherwise.

This generates the password `change-me!`. You can use the password reset feature to change it —
later when the development server is up and running.

### Additional admins

If you need additional admin users add additional blocks of `VILLEKULLA_ADMIN_<counter>_*`-values
and increase the `<counter>`-value accordingly — `1` for the second admin, `2` for the third one, …
you get the drill.

## Define scaffolding data

In order to have some data to work with during development, define scaffolding data. These data will
be used to populate the SQLite database in non-production environments. Since the DB runs
in-memory during development, its data is pretty ephemeral. After each restart of the NodeJS server
it's gone.

So, it makes sense to define some basic `Resources`, `Units`, and `Users`. Therefor rename
`server/scaffolding/data.json.example` to `server/scaffolding/data.json` and add data to it.

```sh
mv server/scaffolding/data.json.example server/scaffolding/data.json
```

This should be pretty straight-forward. All the `id`-values are supposed to be alphnumeric
9-character values. Feel free to re-use the `npm run create-id`-command here.

The values of `Unit.color` should be a hexadecimal color value, like e.g. `#FF00FF`.

## Run the development server

When all the configuration is done, you're ready to start the engines. The booking tool consists of
two parts: the NodeJS server located in `server/`, and a Single Page Application located in
`client/`.

Both have development severs that need to run. But don't worry, there's a single command that fires
up both of them in parallel:

```sh
npm run dev
```

The NodeJS server uses [`nodemon`](https://www.npmjs.com/package/nodemon), so every file change in
`server/` will cause a restart of the NodeJS, making sure the client is always talking to the latest
version of the server.

When the server is running, head over to your browser and visit
[localhost:3000/app](http://localhost:3000/app).

## Contributing

If you want to contribute to the project please adhere to the following flow:

1. Add your fix or feature
2. Create a feature branch
3. Use the [semantic commit
   convention](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) for your
   commits; use the scopes `server`, `client` or `types` when changing something in those folders,
   otherwise omit the scope
4. Push your changes and open a pull reqest
5. Tests are nice but not mandatory

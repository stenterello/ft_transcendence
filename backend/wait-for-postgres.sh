#!/bin/sh
# wait-for-postgres.sh
>&2 echo "checking postgres..."

until PGPASSWORD=$POSTGRES_PASSWORD PGUSER=$POSTGRES_USER PGHOST=$POSTGRES_DB_HOST PGDATABASE=$POSTGRES_DB_PREFIX"_"$POSTGRES_DB_NAME psql -c '\q'; do
	>&2 echo "postgres is unavailable - sleeping"
	sleep 1
done
>&2 echo "postgres is up..."

sleep 3

/bin/sh "$@"

# This is sooo hacky, but it works (at least until Mongo changes its error messages)
until [ "$(curl --connect-timeout 10 --silent --show-error database:27017 | tr -d '\r\n')" = "It looks like you are trying to access MongoDB over HTTP on the native driver port." ]; do
  >&2 echo "Awaiting database..."
  sleep 1
done

>&2 echo "Executing server command"

exec "$@"
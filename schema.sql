CREATE DATABASE chatroomdb;

\c chatroomdb;

CREATE TABLE IF NOT EXISTS messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  socket_id  TEXT        NOT NULL
);
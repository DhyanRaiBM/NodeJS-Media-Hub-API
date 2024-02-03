
-- Numeric Data Types
CREATE TABLE NumericDataTypes (
    integer_column INTEGER,
    smallint_column SMALLINT,
    bigint_column BIGINT,
    numeric_column NUMERIC(precision, scale),
    decimal_column DECIMAL(precision, scale)
);

-- Character String Data Types
CREATE TABLE CharacterDataTypes (
    char_column CHAR(n),
    varchar_column VARCHAR(n),
    text_column TEXT
);

-- Date and Time Data Types
CREATE TABLE DateTimeDataTypes (
    date_column DATE,
    time_column TIME,
    timestamp_column TIMESTAMP
);

-- Boolean Data Type
CREATE TABLE BooleanDataType (
    boolean_column BOOLEAN
);

-- Binary Data Types
CREATE TABLE BinaryDataTypes (
    bytea_column BYTEA
);

-- Other Data Types
CREATE TABLE OtherDataTypes (
    array_column ARRAY[data_type],
    json_column JSON,
    uuid_column UUID
);

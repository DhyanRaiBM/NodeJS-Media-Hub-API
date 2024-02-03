-- Add Columns
ALTER TABLE table_name
    ADD COLUMN new_column INTEGER;

-- Modify Column Data Type
ALTER TABLE table_name
    ALTER COLUMN column_name TYPE VARCHAR(100);

-- Rename Column
ALTER TABLE table_name
    RENAME COLUMN old_column TO new_column;

-- Drop Column
ALTER TABLE table_name
    DROP COLUMN column_name;

-- Add Primary Key
ALTER TABLE table_name
    ADD CONSTRAINT pk_constraint_name PRIMARY KEY (column_name);

-- Add Foreign Key
ALTER TABLE child_table_name
    ADD CONSTRAINT fk_constraint_name
    FOREIGN KEY (child_column_name)
    REFERENCES parent_table_name(parent_column_name);

-- Add Check Constraint
ALTER TABLE table_name
    ADD CONSTRAINT check_constraint_name CHECK (condition);

-- Rename Table
ALTER TABLE old_table_name
    RENAME TO new_table_name;

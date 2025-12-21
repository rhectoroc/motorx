-- motorx/node_modules/std-env

-- Name: DATABASE_URL
-- Value: postgresql://user:password@localhost:5432/mydb 
-- Value: postgresql://user:password@localhost/mydb 

CREATE TABLE IF NOT EXISTS auth (
	id SERIAL PRIMARY KEY
	, email varchar(500) NOT NULL UNIQUE
	, password varchar(2048) NOT NULL);

CREATE TABLE IF NOT EXISTS auctions (id SERIAL PRIMARY KEY
, name varchar(255) NOT NULL
, location varchar(255) NOT NULL
, address text NULL
, postal_code varchar(20) NULL
, created_at timestamp DEFAULT CURRENT_TIMESTAMP
, updated_at timestamp DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS destinations (id SERIAL PRIMARY KEY
	, country_name varchar(255) NOT NULL
	, country_code varchar(10) NULL
	, port_name varchar(255) NULL
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY
	, name varchar(255) NOT NULL
	, description text NULL
	, category varchar(100) NOT NULL
	, is_active boolean DEFAULT true
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS service_charges (id SERIAL PRIMARY KEY
	, service_id bigint NOT NULL
	, charge_name varchar(255) NOT NULL
	, base_price numeric(10, 2) NOT NULL
	, price_level varchar(10) NULL
	, auction_specific boolean DEFAULT false
	, auction_id bigint NULL
	, markup_fee numeric(10, 2) DEFAULT 0
	, financing_fee numeric(10, 2) DEFAULT 0
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT service_charges_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services (id) ON UPDATE NO ACTION ON DELETE CASCADE
	, CONSTRAINT service_charges_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions (id) ON UPDATE NO ACTION ON DELETE NO ACTION);

CREATE TABLE IF NOT EXISTS shippers_terminals (id SERIAL PRIMARY KEY
	, name varchar(255) NOT NULL
	, location varchar(255) NOT NULL
	, address text NULL
	, postal_code varchar(20) NULL
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS auth_users (id SERIAL PRIMARY KEY
	, name varchar(255) NOT NULL
	, email varchar(255) NOT NULL
	, emailVerified timestamp WITH TIME ZONE
	, image text
	, role varchar(50) NOT NULL DEFAULT 'client'
	, is_main_client boolean NOT NULL DEFAULT false
	, main_client_id bigint NULL
	, CONSTRAINT auth_users_main_client_id_fkey FOREIGN KEY (main_client_id) REFERENCES public.auth_users (id) ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS auth_accounts (id SERIAL PRIMARY KEY
	, userId integer NOT NULL
	, type varchar(255) NOT NULL
	, provider varchar(255) NOT NULL
	, providerAcountId varchar(255) NOT NULL
    , refresh_token text
	, access_token text
    , expires_at bigint
    , id_token text
    , scope text
    , session_state text
    , token_type text
	, password text
	, CONSTRAINT auth_accounts_userId_fkey FOREIGN KEY (userId) REFERENCES public.auth_users (id) ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS auth_sessions(id serial PRIMARY KEY
	, userId integer NOT NULL
	, expires timestamp WITH TIME ZONE NOT NULL
	, sessionToken varchar(255) NOT NULL
	, CONSTRAINT auth_sessions_userId_fkey FOREIGN KEY (userId) REFERENCES public.auth_users (id) ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS vehicles(id SERIAL PRIMARY KEY
	, vin varchar(17) NOT NULL
	, client_id bigint NOT NULL
	, description text
	, auction_id bigint
	, purchase_price numeric(10, 2)
	, purchase_date timestamp
	, current_status varchar(100) DEFAULT 'purchased'
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT vehicles_vin_key UNIQUE (vin)
	, CONSTRAINT vehicles_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.auth_users (id) ON UPDATE NO ACTION ON DELETE CASCADE
	, CONSTRAINT vehicles_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions (id) ON UPDATE NO ACTION ON DELETE NO ACTION);

CREATE TABLE IF NOT EXISTS client_hierarchy(id SERIAL PRIMARY KEY
	, main_client_id bigint NOT NULL
	, sub_client_id bigint NOT NULL
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT client_hierarchy_main_client_id_sub_client_id_key UNIQUE(main_client_id, sub_client_id)
	, CONSTRAINT client_hierarchy_main_client_id_fkey FOREIGN KEY (main_client_id) REFERENCES public.auth_users (id) ON UPDATE NO ACTION
	, CONSTRAINT client_hierarchy_sub_client_id_fkey FOREIGN KEY (sub_client_id) REFERENCES public.auth_users (id) ON UPDATE NO ACTION);


CREATE TABLE IF NOT EXISTS vehicle_service_details (id SERIAL PRIMARY KEY
	, vehicle_id bigint NOT NULL
	, service_id bigint NOT NULL
	, status varchar(50) DEFAULT 'pending'
	, start_date timestamp
	, completion_date timestamp
	, total_cost numeric(10, 2) DEFAULT 0
	, notes text
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT vehicle_service_details_vehicle_id_service_id_key UNIQUE (vehicle_id, service_id)
	, CONSTRAINT vehicle_service_details_vehicle_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles (id) ON UPDATE NO ACTION
	, CONSTRAINT vehicle_service_details_service_id_fk FOREIGN KEY (service_id) REFERENCES public.services (id) ON UPDATE NO ACTION
	);
	
CREATE TABLE IF NOT EXISTS vehicle_service_charges (id SERIAL PRIMARY KEY
	, vehicle_service_detail_id bigint NOT NULL
	, service_charge_id bigint NOT NULL
	, applied_price numeric(10, 2) NOT NULL
	, quantity integer DEFAULT 1
	, total_amount numeric(10, 2) NOT NULL
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT vehicle_service_charges_vehicle_service_detail_id_fkey FOREIGN KEY (vehicle_service_detail_id) REFERENCES public.vehicle_service_details (id) ON UPDATE NO ACTION ON DELETE CASCADE
	, CONSTRAINT vehicle_service_charges_service_charge_id_fkey FOREIGN KEY (service_charge_id) REFERENCES public.service_charges (id) ON UPDATE NO ACTION ON DELETE CASCADE);
	
CREATE TABLE IF NOT EXISTS auth_verification_token (identifier text
	, expires timestamp WITH TIME ZONE NOT NULL
	, token text);

CREATE TABLE IF NOT EXISTS transport_prices_a_b (id SERIAL PRIMARY KEY
	, auction_id bigint NOT NULL
	, terminal_id bigint NOT NULL
	, price NUMERIC(10, 2) NOT NULL
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT transport_prices_a_b_auction_id_terminal_id_key UNIQUE (auction_id, terminal_id)
	, CONSTRAINT transport_prices_a_b_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions (id) ON UPDATE NO ACTION ON DELETE CASCADE
	, CONSTRAINT transport_prices_a_b_terminal_id_fkey FOREIGN KEY (terminal_id) REFERENCES public.shippers_terminals (id) ON UPDATE NO ACTION ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS transport_prices_b_c (id SERIAL PRIMARY KEY
	, terminal_id bigint NOT NULL
	, destination_id bigint NOT NULL
	, price NUMERIC(10, 2) NOT NULL
	, created_at timestamp DEFAULT CURRENT_TIMESTAMP
	, updated_at timestamp DEFAULT CURRENT_TIMESTAMP
	, CONSTRAINT transport_prices_b_c_terminal_id_destination_id_key UNIQUE (terminal_id, destination_id)
	, CONSTRAINT transport_prices_b_c_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations (id) ON UPDATE NO ACTION ON DELETE CASCADE
	, CONSTRAINT transport_prices_a_b_terminal_id_fkey FOREIGN KEY (terminal_id) REFERENCES public.shippers_terminals (id) ON UPDATE NO ACTION ON DELETE CASCADE);

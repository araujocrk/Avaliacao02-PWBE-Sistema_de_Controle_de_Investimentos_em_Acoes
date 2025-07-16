CREATE TABLE IF NOT EXISTS usuarios (
	id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	senha VARCHAR(300) NOT NULL
);

CREATE TABLE IF NOT EXISTS operacoes (
	id_operacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_usuario_fk INT NOT NULL,
	data date NOT NULL,
	ativo VARCHAR(6) NOT NULL,
	tipo_operacao VARCHAR(10) CHECK (tipo_operacao IN ('compra', 'venda')) NOT NULL,
	quantidade INTEGER NOT NULL,
	preco NUMERIC(12, 2) NOT NULL,
	valor_bruto NUMERIC(14, 2) NOT NULL,
	taxa_b3 NUMERIC(10,2) NOT NULL,
	valor_liquido NUMERIC(14, 2) NOT NULL,
	CONSTRAINT usuario_operacao_fk FOREIGN KEY (id_usuario_fk)
	REFERENCES usuarios (id_usuario)
	ON DELETE CASCADE
	ON UPDATE NO ACTION
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

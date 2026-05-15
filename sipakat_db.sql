--
-- PostgreSQL database dump
--

\restrict j992b61DCq2nFxUcRAv19QZ9q7SBCnS5i7b8QA07k1GFr3V9qicfXHdBfiRNdIP

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    aksi character varying(100) NOT NULL,
    modul character varying(50) NOT NULL,
    deskripsi text,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.activity_log OWNER TO postgres;

--
-- Name: arsip_perencanaan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arsip_perencanaan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_dokumen character varying(255) NOT NULL,
    jenis_dokumen character varying(100) NOT NULL,
    tahun character varying(4) NOT NULL,
    tanggal date NOT NULL,
    deskripsi text,
    file_path character varying(500),
    file_name character varying(255),
    file_size integer,
    file_type character varying(100),
    status character varying(20) DEFAULT 'aktif'::character varying,
    dibuat_oleh uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT arsip_perencanaan_status_check CHECK (((status)::text = ANY ((ARRAY['aktif'::character varying, 'arsip'::character varying, 'hapus'::character varying])::text[])))
);


ALTER TABLE public.arsip_perencanaan OWNER TO postgres;

--
-- Name: kepegawaian_aparatur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kepegawaian_aparatur (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama character varying(100) NOT NULL,
    nip character varying(30),
    jabatan character varying(100) NOT NULL,
    foto character varying(255),
    status character varying(20) DEFAULT 'aktif'::character varying,
    no_hp character varying(20),
    email character varying(100),
    alamat text,
    tanggal_lahir date,
    tanggal_bergabung date,
    pendidikan character varying(100),
    golongan character varying(20),
    keterangan text,
    dibuat_oleh uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kepegawaian_aparatur_status_check CHECK (((status)::text = ANY ((ARRAY['aktif'::character varying, 'nonaktif'::character varying, 'pensiun'::character varying])::text[])))
);


ALTER TABLE public.kepegawaian_aparatur OWNER TO postgres;

--
-- Name: keuangan_desa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keuangan_desa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_dokumen character varying(255) NOT NULL,
    jenis_dokumen character varying(100) NOT NULL,
    tahun character varying(4) NOT NULL,
    tanggal date NOT NULL,
    nominal numeric(15,2),
    deskripsi text,
    file_path character varying(500),
    file_name character varying(255),
    file_size integer,
    file_type character varying(100),
    status character varying(20) DEFAULT 'aktif'::character varying,
    dibuat_oleh uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT keuangan_desa_status_check CHECK (((status)::text = ANY ((ARRAY['aktif'::character varying, 'arsip'::character varying, 'hapus'::character varying])::text[])))
);


ALTER TABLE public.keuangan_desa OWNER TO postgres;

--
-- Name: login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    ip_address character varying(50),
    device_info text,
    browser character varying(100),
    os character varying(100),
    status character varying(20) DEFAULT 'success'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT login_history_status_check CHECK (((status)::text = ANY ((ARRAY['success'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.login_history OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_lengkap character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    jabatan character varying(100),
    status character varying(20) DEFAULT 'aktif'::character varying,
    no_hp character varying(20),
    alamat text,
    foto character varying(255),
    hak_akses character varying(20) DEFAULT 'user'::character varying,
    catatan text,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_hak_akses_check CHECK (((hak_akses)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying, 'viewer'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['aktif'::character varying, 'nonaktif'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_log (id, user_id, aksi, modul, deskripsi, ip_address, created_at) FROM stdin;
fb79efa8-3710-46c6-a64d-6c3f9c4a57a1	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-10 10:02:28.705867
8299a673-c2bc-4910-a0a2-6674825a00fd	bfb684c9-c089-4d11-974f-618e48f57deb	TAMBAH	ARSIP	Menambah arsip: d	::1	2026-05-10 20:39:28.162225
9092740a-c4d6-4321-b8b6-c131612b2a09	bfb684c9-c089-4d11-974f-618e48f57deb	EDIT_PROFIL	PROFIL	Mengubah profil	::1	2026-05-10 20:45:24.239242
e2458ec1-e7b1-421e-a119-45dba45d2d0b	bfb684c9-c089-4d11-974f-618e48f57deb	TAMBAH_USER	PROFIL	Admin menambah user: admin2	::1	2026-05-10 20:46:13.457467
13bfa1c3-d196-46b6-b717-8edfaeb2dbc6	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-10 20:46:21.700319
05f4a6d1-8026-4e17-8785-5b24547c4ad5	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-10 20:47:59.145051
489237e8-5646-4d15-9472-3183bfe29e49	bfb684c9-c089-4d11-974f-618e48f57deb	EDIT_USER	PROFIL	Admin mengubah user: admin2 (ID: 61977aef-f4e5-41a9-925b-5e9a4e8d10ed)	::1	2026-05-10 20:48:18.422585
28ca3edf-5864-4b6d-b80c-27b1531c3f46	bfb684c9-c089-4d11-974f-618e48f57deb	EDIT_USER	PROFIL	Admin mengubah user: admin2 (ID: 61977aef-f4e5-41a9-925b-5e9a4e8d10ed)	::1	2026-05-10 20:48:19.721121
c198ef02-7ec7-418a-b900-9da9f4732d77	\N	LOGIN	AUTH	User admin2 berhasil login	::1	2026-05-10 20:46:24.71909
3b4e6b63-2870-47dd-aee2-e9bbcfe2cdb8	\N	EDIT_PROFIL	PROFIL	Mengubah profil	::1	2026-05-10 20:47:00.244168
5cf5f2e5-4d3f-4a09-aa5d-140ea794f4ad	\N	UBAH_PASSWORD	AUTH	User mengubah password	::1	2026-05-10 20:47:12.992961
c67736d6-0cee-4c1c-bac8-b024338736d2	\N	LOGOUT	AUTH	User admin2 logout	::1	2026-05-10 20:47:29.508325
bb704d01-969b-4706-922f-01b73e01acb0	bfb684c9-c089-4d11-974f-618e48f57deb	HAPUS_USER	PROFIL	Admin menghapus user: admin2 (ID: 61977aef-f4e5-41a9-925b-5e9a4e8d10ed)	::1	2026-05-10 20:48:21.63624
a6c54584-d011-4f8f-96ca-210557c185f0	bfb684c9-c089-4d11-974f-618e48f57deb	TAMBAH_USER	PROFIL	Admin menambah user: user	::1	2026-05-10 20:48:42.346431
6f6a616c-4072-49bf-9e8b-204f531f0522	bfb684c9-c089-4d11-974f-618e48f57deb	TAMBAH	KEPEGAWAIAN	Menambah aparatur: Ronald Budi Abdul Wahid	::1	2026-05-10 21:00:30.506026
4ecd6179-2ab8-40d4-9fb6-2ee2de7c23a7	bfb684c9-c089-4d11-974f-618e48f57deb	EDIT	KEPEGAWAIAN	Mengubah data aparatur: Ronald Budi Abdul Wahid	::1	2026-05-10 21:00:37.865581
c82b2ff9-04f0-472b-82f7-e6e9aae7b1dc	bfb684c9-c089-4d11-974f-618e48f57deb	TAMBAH	KEUANGAN	Menambah dokumen keuangan: APB	::1	2026-05-10 21:10:04.251225
9353f359-38b7-487a-8d2b-1c2df96f0085	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-11 09:26:59.15425
b1503069-4e71-4396-9478-f6c2f6bc0b9c	24966465-8854-4fe6-a2d3-0ebaae8f59a1	LOGIN	AUTH	User user berhasil login	::1	2026-05-11 09:27:15.084749
14e146cf-16ef-4171-ab6f-01496203898c	24966465-8854-4fe6-a2d3-0ebaae8f59a1	LOGOUT	AUTH	User user logout	::1	2026-05-11 09:27:24.931653
54a940e2-d381-480e-9954-6b4316dd4bdd	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-11 09:27:40.301613
fea421b5-446c-49bf-a161-466bb20fd0bd	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-11 09:28:23.684296
1828afb9-2d31-4107-bbd4-e7cd57cce512	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-11 09:38:55.198414
3c11a7d1-9d4d-436e-91e7-104f8b685656	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-11 09:38:59.109694
45355060-1425-4509-84fa-cdc6923ea6b2	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-11 09:48:39.285278
293c6f82-d4f6-4d54-952a-5654cc46b3a4	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-11 09:48:48.215621
31704963-570c-4b39-adff-8d0ca5538e26	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-11 09:57:35.474402
39b515fe-cdba-471c-8277-436ad778eada	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-11 10:01:02.463001
3ce3b182-aeb3-4321-aa8e-cf20e16888a9	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-11 10:08:05.407747
29eb3044-198d-47f6-9b59-c82d802d79ac	bfb684c9-c089-4d11-974f-618e48f57deb	EDIT	KEUANGAN	Mengubah dokumen keuangan: APB	::1	2026-05-11 10:18:27.375596
7fac8b53-de08-4355-bcf3-2d7cf6a9dc76	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-11 21:55:38.400359
7bbab294-f65a-44ed-98c3-a5c9acda878e	bfb684c9-c089-4d11-974f-618e48f57deb	DOWNLOAD	KEUANGAN	Download keuangan: APB	::1	2026-05-11 21:57:20.865926
0e6912a0-51df-4e3c-b271-26a6dd872dc3	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-13 12:09:49.472043
d8fa3ae2-c934-4c22-8361-f2b2fde09101	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-13 18:36:00.774682
616fcebb-7169-4103-b411-ac4e09fcfb23	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-13 18:36:50.659423
47fa4afc-5ffe-4753-9b0e-246a7ad80dc9	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-13 18:40:49.927849
40a49f11-9fd0-4405-ba78-fcaf2e6900cc	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-13 18:40:53.738092
8396cd03-ea05-4a49-8e8e-d3a0b6046f36	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-13 18:41:06.393205
42e0770c-edd6-4109-8a1f-37707e86b311	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-13 18:43:03.77974
8feb865f-b8d0-4e69-b606-fe2cbc9f1eab	bfb684c9-c089-4d11-974f-618e48f57deb	LOGOUT	AUTH	User admin logout	::1	2026-05-15 19:57:35.149998
9ef56e86-46b0-43ec-a966-4fd4e5bb3308	bfb684c9-c089-4d11-974f-618e48f57deb	LOGIN	AUTH	User admin berhasil login	::1	2026-05-15 19:57:39.371034
\.


--
-- Data for Name: arsip_perencanaan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arsip_perencanaan (id, nama_dokumen, jenis_dokumen, tahun, tanggal, deskripsi, file_path, file_name, file_size, file_type, status, dibuat_oleh, created_at, updated_at) FROM stdin;
daafe20b-d691-44c4-afeb-8f8864c5f5f7	d	RKPDes	2024	2026-05-10	dd	/uploads/documents/doc-1778420368151-335602803.pdf	coba.pdf	1797147	application/pdf	aktif	bfb684c9-c089-4d11-974f-618e48f57deb	2026-05-10 20:39:28.1577	2026-05-10 20:39:28.1577
\.


--
-- Data for Name: kepegawaian_aparatur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kepegawaian_aparatur (id, nama, nip, jabatan, foto, status, no_hp, email, alamat, tanggal_lahir, tanggal_bergabung, pendidikan, golongan, keterangan, dibuat_oleh, created_at, updated_at) FROM stdin;
ccf88984-41f8-4ae2-97c5-1f4f5258a660	Ronald Budi Abdul Wahid	191371	Kelapa	/uploads/photos/photo-1778421637849-254689926.jpg	aktif	087719010818	test@gmail.com	Jl. margorejo masjid 15D	2026-05-09	2026-05-09	S1	II/d	sld	bfb684c9-c089-4d11-974f-618e48f57deb	2026-05-10 21:00:30.47068	2026-05-10 21:00:37.852226
\.


--
-- Data for Name: keuangan_desa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keuangan_desa (id, nama_dokumen, jenis_dokumen, tahun, tanggal, nominal, deskripsi, file_path, file_name, file_size, file_type, status, dibuat_oleh, created_at, updated_at) FROM stdin;
c79617f1-2fa5-48c4-ba9f-6acc96392cba	APB	SPJ	2024	2026-06-04	200000000.00	wd	/uploads/keuangan/keu-1778422204232-865478571.pdf	coba.pdf	1797147	application/pdf	aktif	bfb684c9-c089-4d11-974f-618e48f57deb	2026-05-10 21:10:04.239663	2026-05-11 10:18:27.36635
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_history (id, user_id, ip_address, device_info, browser, os, status, created_at) FROM stdin;
2bd3e0f7-2eaa-4cab-9b86-0478c90d75be	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-10 10:02:28.696917
372297e9-fc4c-4413-8feb-744606b56bdb	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-10 20:47:32.4712
82749c63-f25f-4c54-8961-f8beea962dff	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-10 20:47:40.754061
4aabe523-816a-441e-9f21-0249fe3995dc	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-10 20:47:59.136221
b8da2a9c-d059-4adb-bc0f-09274d8984b9	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-11 09:27:06.111512
859e70cc-abd1-4769-8975-d2317dae27e5	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-11 09:27:10.289081
dbaba550-95d3-41e7-b90f-1cec26cc7092	24966465-8854-4fe6-a2d3-0ebaae8f59a1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 09:27:15.082063
f8d900b1-3a09-4227-b60f-e8330130437e	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-11 09:27:33.441075
835e6069-76bd-4151-8f03-22c994b0539f	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 09:27:40.29172
2d6dafdf-fe58-455f-ad37-d6afa073ea75	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 09:38:55.194845
efcf274a-6f89-4546-b30a-6324bef43cdd	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 09:48:39.282108
adac4138-6140-42f2-9694-4f3e4baa02dd	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 09:57:35.465687
b848e011-1ba0-4c58-8a32-a44aadb4a7aa	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-11 10:07:55.626234
4bd7419e-03ae-4fac-87b3-7eba7a33e02d	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 10:08:05.397812
ca49988c-49c1-42e2-ae54-813f46e7d148	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-11 21:55:38.395631
1ce79a0f-e46b-4408-be96-0dedcb2c0a79	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-13 12:09:43.829821
862b0173-3b2e-4948-8874-6c6439e4084c	\N	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-13 12:09:47.111952
ec56f7e0-1677-4b77-bcd1-6819e05707eb	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-13 12:09:49.469246
42fc238e-c7e3-454e-a775-ff1e82c4349f	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-13 18:36:00.757892
f5e82704-2940-4476-bc91-81cbd59a0c29	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-13 18:36:50.655363
c11b30ab-4a43-473b-90b6-1672fa46c561	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-13 18:40:53.735105
652f7aed-96c7-49d5-842a-70e1e6f4a8e7	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	failed	2026-05-13 18:42:57.815532
0006b4b0-29b8-4ecf-940c-c8b89e669d6a	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-13 18:43:03.770968
36b9eb93-f47c-45c1-bfc6-c0005ea66779	bfb684c9-c089-4d11-974f-618e48f57deb	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Linux	success	2026-05-15 19:57:39.367003
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama_lengkap, username, email, password, jabatan, status, no_hp, alamat, foto, hak_akses, catatan, last_login, created_at, updated_at) FROM stdin;
24966465-8854-4fe6-a2d3-0ebaae8f59a1	user	user	user@gmail.com	$2a$10$ZWtv.XERa8DCNSyMjOQ9NObJqUw4r26sydKe385S1fVuybE.mYTvC	user	aktif	087719010818	Jl. margorejo masjid 15D	\N	user	\N	2026-05-11 09:27:15.070115	2026-05-10 20:48:42.322255	2026-05-11 09:27:15.070115
bfb684c9-c089-4d11-974f-618e48f57deb	Iamrnldo	admin	iamrnldo@gmail.com	$2a$10$B/IvkIFU1X0f9I2KQWRnJe5F3IC5wFSvqrXnk0TUiXlEnAW32uGAa	Administrator	aktif	087719010818	Jl. margorejo masjid 15D	\N	admin	Tester	2026-05-15 19:57:39.361775	2026-05-10 09:22:15.848068	2026-05-15 19:57:39.361775
\.


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: arsip_perencanaan arsip_perencanaan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip_perencanaan
    ADD CONSTRAINT arsip_perencanaan_pkey PRIMARY KEY (id);


--
-- Name: kepegawaian_aparatur kepegawaian_aparatur_nip_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kepegawaian_aparatur
    ADD CONSTRAINT kepegawaian_aparatur_nip_key UNIQUE (nip);


--
-- Name: kepegawaian_aparatur kepegawaian_aparatur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kepegawaian_aparatur
    ADD CONSTRAINT kepegawaian_aparatur_pkey PRIMARY KEY (id);


--
-- Name: keuangan_desa keuangan_desa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keuangan_desa
    ADD CONSTRAINT keuangan_desa_pkey PRIMARY KEY (id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_activity_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_user ON public.activity_log USING btree (user_id);


--
-- Name: idx_arsip_jenis; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_arsip_jenis ON public.arsip_perencanaan USING btree (jenis_dokumen);


--
-- Name: idx_arsip_tahun; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_arsip_tahun ON public.arsip_perencanaan USING btree (tahun);


--
-- Name: idx_kepegawaian_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kepegawaian_status ON public.kepegawaian_aparatur USING btree (status);


--
-- Name: idx_keuangan_tahun; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_keuangan_tahun ON public.keuangan_desa USING btree (tahun);


--
-- Name: idx_login_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_login_user ON public.login_history USING btree (user_id);


--
-- Name: arsip_perencanaan update_arsip_perencanaan_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_arsip_perencanaan_updated_at BEFORE UPDATE ON public.arsip_perencanaan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: kepegawaian_aparatur update_kepegawaian_aparatur_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_kepegawaian_aparatur_updated_at BEFORE UPDATE ON public.kepegawaian_aparatur FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: keuangan_desa update_keuangan_desa_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_keuangan_desa_updated_at BEFORE UPDATE ON public.keuangan_desa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_log activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: arsip_perencanaan arsip_perencanaan_dibuat_oleh_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip_perencanaan
    ADD CONSTRAINT arsip_perencanaan_dibuat_oleh_fkey FOREIGN KEY (dibuat_oleh) REFERENCES public.users(id);


--
-- Name: kepegawaian_aparatur kepegawaian_aparatur_dibuat_oleh_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kepegawaian_aparatur
    ADD CONSTRAINT kepegawaian_aparatur_dibuat_oleh_fkey FOREIGN KEY (dibuat_oleh) REFERENCES public.users(id);


--
-- Name: keuangan_desa keuangan_desa_dibuat_oleh_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keuangan_desa
    ADD CONSTRAINT keuangan_desa_dibuat_oleh_fkey FOREIGN KEY (dibuat_oleh) REFERENCES public.users(id);


--
-- Name: login_history login_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict j992b61DCq2nFxUcRAv19QZ9q7SBCnS5i7b8QA07k1GFr3V9qicfXHdBfiRNdIP


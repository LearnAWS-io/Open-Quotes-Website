/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly TABLE_NAME: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

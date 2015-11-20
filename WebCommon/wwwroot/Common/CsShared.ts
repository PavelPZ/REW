module servConfig {
export interface Root {
  azure: Azure;
}
export interface Azure {
  connectionString: string;
  blobJS: string;
  blobMM: string;
}
}



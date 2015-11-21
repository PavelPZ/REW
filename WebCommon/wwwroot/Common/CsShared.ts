module LMComLib {
export const enum Langs {
  no = 0,
  lang = 1,
  cs_cz = 2,
  en_gb = 3,
  de_de = 4,
  sk_sk = 5,
  fr_fr = 6,
  it_it = 7,
  sp_sp = 8,
  ru_ru = 9,
  vi_vn = 10,
  es_es = 11,
  fi_fi = 12,
  sv_se = 13,
  da_dk = 14,
  nb_no = 15,
  af_za = 16,
  sq_al = 17,
  ar_sa = 18,
  hy_am = 19,
  as_in = 20,
  az_latn_az = 21,
  eu_es = 22,
  bn_in = 23,
  be_by = 24,
  pt_br = 25,
  br_fr = 26,
  bg_bg = 27,
  fr_ca = 28,
  zh_hk = 29,
  ca_es = 30,
  co_fr = 31,
  hr_hr = 32,
  nl_nl = 34,
  en_us = 35,
  et_ee = 36,
  gl_es = 37,
  ka_ge = 38,
  el_gr = 39,
  gu_in = 40,
  ha_latn_ng = 41,
  he_il = 42,
  hi_in = 43,
  hu_hu = 44,
  zh_cn = 45,
  is_is = 46,
  ig_ng = 47,
  id_id = 48,
  ga_ie = 49,
  ja_jp = 50,
  kn_in = 51,
  km_kh = 52,
  ky_kg = 53,
  ko_kr = 54,
  lo_la = 55,
  es_mx = 56,
  lv_lv = 57,
  lt_lt = 58,
  mk_mk = 59,
  ms_my = 60,
  ml_in = 61,
  mt_mt = 62,
  mi_nz = 63,
  mr_in = 64,
  mn_mn = 65,
  ne_np = 66,
  oc_fr = 67,
  ps_af = 68,
  fa_ir = 69,
  pl_pl = 70,
  pt_pt = 71,
  pa_in = 72,
  quz_pe = 73,
  ro_ro = 74,
  sr_latn_cs = 75,
  nso_za = 76,
  si_lk = 77,
  sl_si = 78,
  sw_ke = 79,
  ta_in = 80,
  te_in = 81,
  th_th = 82,
  bo_cn = 83,
  tn_za = 84,
  tr_tr = 85,
  uk_ua = 86,
  ur_pk = 87,
  uz_latn_uz = 88,
  cy_gb = 89,
  xh_za = 90,
  yo_ng = 91,
  zu_za = 92,
  bs = 93,
  en_nz = 94,
  ku_arab = 95,
  LMPage_GetLang = 999,
}

}

module servConfig {
export const enum oAuthProviders {
  no = 0,
  google = 1,
  facebook = 2,
  microsoft = 3,
}

export const enum SkinIds {
  bs = 0,
  mdl = 1,
}

export const enum Brands {
  lm = 0,
  skrivanek = 1,
  grafia = 2,
  edusoft = 3,
}

export const enum Apps {
  web4 = 0,
  web = 1,
  oauth = 2,
}

export interface Root {
  azure: Azure;
  defaultPars: ViewPars;
  oAuth: oAuthConfig;
}
export interface Azure {
  connectionString: string;
  blobJS: string;
  blobMM: string;
}
export interface ViewPars {
  app: Apps;
  lang: LMComLib.Langs;
  brand: Brands;
  skin: SkinIds;
  debug: boolean;
  swFromFileSystem: boolean;
}
export interface oAuthConfig {
  items: Array<oAuthItem>;
}
export interface oAuthItem {
  clientId: string;
}
}


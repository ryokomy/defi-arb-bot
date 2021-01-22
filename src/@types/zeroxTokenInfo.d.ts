export type ZeroxToken = {
  symbol: string;
  address: string;
  name: string;
  decimals: number;
};

export type ZeroxTokenInfo = {
  [symbol: string]: ZeroxToken;
};

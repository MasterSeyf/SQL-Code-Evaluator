export interface IVariantParameters {
  joinVariant: number;
  aliasVariant: number;
}

export function translateVariants(param: IVariantParameters): string {
  const { joinVariant, aliasVariant } = param;
  let VariantJOIN: string = '';
  let VariantALIAS: string = '';
  let aliasFirst: string = '';
  let aliasSecond: string = '';
  let variantFirst: string = '';
  let variantSecond: string = '';
  let variantThird: string = '';

  // No longer in use
  if (joinVariant == 1) {
    //
  } else if (joinVariant == 2) {
    VariantJOIN = 'Postfix';
    variantFirst = '';
    variantSecond = '       JOIN\n';
    variantThird = '\n       ON (A.attribut1 = B.attribut2)';
  } else if (joinVariant == 3) {
    VariantJOIN = 'Infix  ';
    variantFirst = '';
    variantSecond = '       ⋈ (A.attribut1 = B.attribut2)\n';
    variantThird = '';
  }
  // No longer in use
  else if (joinVariant == 4) {
    VariantJOIN = 'Prefix ';
    variantFirst = '  ⋈ (A.attribut1 = B.attribut2)\n     ';
    variantSecond = '';
    variantThird = '';
  }
  // No longer in use
  if (aliasVariant == 1) {
    VariantALIAS = 'Postfix ohne NL  ';
    aliasFirst = '  Tabelle AS A\n';
    aliasSecond = '       Tabelle AS B';
  } else if (aliasVariant == 0) {
    VariantALIAS = 'Prefix          ';
    aliasFirst = '  A AS Tabelle\n';
    aliasSecond = '       B AS Tabelle';
  } else if (aliasVariant == 2) {
    VariantALIAS = 'Postfix         ';
    aliasFirst = '  Tabelle \n       AS A\n';
    aliasSecond = '       Tabelle \n       AS B';
  }

  return 'Umbenennung: ' + VariantALIAS + '\nVerbund:     ' + VariantJOIN + '\n\n____Beispiel:____\nSELECT *\nFROM ' + variantFirst + aliasFirst + variantSecond + aliasSecond + variantThird + ';';
}

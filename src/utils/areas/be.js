export const areasBe = [
  {
    code_name: "brussels",
    zipMin: "1000",
    zipMax: "1299"
  },
  {
    code_name: "walloon-brabant",
    zipMin: "1300",
    zipMax: "1499"
  },
  {
    code_name: "flemish-brabant",
    zipMin: "1500",
    zipMax: "1999"
  },
  {
    code_name: "antwerp",
    zipMin: "2000",
    zipMax: "2999"
  },
  {
    code_name: "flemish-brabant",
    zipMin: "3000",
    zipMax: "3499"
  },
  {
    code_name: "limburg",
    zipMin: "3500",
    zipMax: "3999"
  },
  {
    code_name: "liege",
    zipMin: "4000",
    zipMax: "4999"
  },
  {
    code_name: "namur",
    zipMin: "5000",
    zipMax: "5999"
  },
  {
    code_name: "hainaut",
    zipMin: "6000",
    zipMax: "6599"
  },
  {
    code_name: "luxembourg",
    zipMin: "6600",
    zipMax: "6999"
  },
  {
    code_name: "hainaut",
    zipMin: "7000",
    zipMax: "7999"
  },
  {
    code_name: "west-flanders",
    zipMin: "8000",
    zipMax: "8999"
  },
  {
    code_name: "east-flanders",
    zipMin: "9000",
    zipMax: "9999"
  },
].map((a) => ({
  ...a,
  countryCode: "be",
  urlPath: `be/${a.code_name}`
}))

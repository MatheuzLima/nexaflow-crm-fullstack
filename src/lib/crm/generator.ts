import type { Channel, IncomingContact, Service } from "./types"

/** Gerador pseudoaleatório com semente (mulberry32): o mesmo seed gera sempre a mesma demo. */
export type Rng = () => number

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]
}

export function between(rng: Rng, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1))
}

const FIRST = [
  "Ana", "Bruno", "Carla", "Diego", "Eduardo", "Fernanda", "Gustavo", "Helena",
  "Igor", "Juliana", "Karina", "Leandro", "Marcos", "Natália", "Otávio",
  "Patrícia", "Rodrigo", "Sabrina", "Thiago", "Vanessa", "Renato", "Aline",
  "Felipe", "Marina",
]

const LAST = [
  "Almeida", "Barbosa", "Cardoso", "Dias", "Esteves", "Ferreira", "Gomes",
  "Hashimoto", "Ibrahim", "Junqueira", "Klein", "Lopes", "Machado",
  "Nascimento", "Oliveira", "Pereira", "Queiroz", "Ribeiro", "Silva",
  "Teixeira", "Vieira", "Xavier", "Souza", "Monteiro",
]

const COMPANIES = [
  "Distribuidora Serra Azul", "FarmaVida Distribuidora", "Móveis Planalto",
  "Grupo Horizonte Alimentos", "AutoPeças Brasil Sul", "Café Montanha",
  "TecnoMax Eletrônicos", "Bebidas Tropical", "Agro Campos do Sul",
  "Casa & Conforto", "Laboratório Biovita", "ModaViva Confecções",
  "Frigorífico Boa Terra", "Rede Mercado Bom Preço", "Cosméticos Aurora",
  "Metalúrgica Forte", "Pet Mundo Distribuidora", "Livraria Página Viva",
  "Vinhos do Vale Importadora", "Embalagens Ponto Verde",
  "Supermercados Nova Era", "Construtora Pilar", "Laticínios Vale Doce",
  "Ótica Visão Clara",
]

const ROLES = [
  "Gerente de Logística", "Diretor Comercial", "Analista de Compras",
  "Coordenador de Supply Chain", "Sócio-diretor", "Gerente de Operações",
  "Comprador", "Assistente Administrativo", "Proprietário", "Estagiário",
]

const HOME_CITIES: { name: string; uf: string; ddd: number }[] = [
  { name: "São Paulo", uf: "SP", ddd: 11 },
  { name: "Campinas", uf: "SP", ddd: 19 },
  { name: "Curitiba", uf: "PR", ddd: 41 },
  { name: "Belo Horizonte", uf: "MG", ddd: 31 },
  { name: "Joinville", uf: "SC", ddd: 47 },
  { name: "Goiânia", uf: "GO", ddd: 62 },
  { name: "Ribeirão Preto", uf: "SP", ddd: 16 },
  { name: "Porto Alegre", uf: "RS", ddd: 51 },
  { name: "Salvador", uf: "BA", ddd: 71 },
  { name: "Recife", uf: "PE", ddd: 81 },
  { name: "Fortaleza", uf: "CE", ddd: 85 },
  { name: "Uberlândia", uf: "MG", ddd: 34 },
  { name: "Londrina", uf: "PR", ddd: 43 },
  { name: "São José dos Campos", uf: "SP", ddd: 12 },
  { name: "Santos", uf: "SP", ddd: 13 },
]

/** Cidades de uma palavra (ou duas) — o extrator de rotas precisa de nomes próprios simples. */
const ROUTE_CITIES = [
  "São Paulo", "Campinas", "Curitiba", "Belo Horizonte", "Joinville", "Goiânia",
  "Salvador", "Recife", "Fortaleza", "Londrina", "Santos", "Uberlândia",
  "Manaus", "Cuiabá", "Vitória", "Florianópolis", "Sorocaba", "Porto Alegre",
]

type Quality = "h" | "m" | "l"

interface Template {
  q: Quality
  text: string
  /** intervalo de {n} */
  n: [number, number]
}

const TEMPLATES: Record<Service, Template[]> = {
  "Frete rodoviário": [
    { q: "h", n: [8, 60], text: "Bom dia! Preciso de cotação de frete de {a} para {b}, cerca de {n} paletes por semana. Seria contrato mensal e preciso começar na próxima semana." },
    { q: "h", n: [4, 20], text: "Olá, queremos fechar contrato de transporte de carga fechada: {n} viagens por mês de {a} para {b}. Tenho orçamento aprovado pela diretoria." },
    { q: "m", n: [10, 14], text: "Olá, gostaria de saber o valor do frete de {a} para {b}. Carga fracionada, uns {n} volumes. Preciso despachar amanhã." },
    { q: "l", n: [1, 1], text: "Oi, só estou pesquisando preços de transportadora, sem previsão de contratar agora." },
    { q: "l", n: [1, 1], text: "Boa tarde, quanto custa um frete?" },
  ],
  Armazenagem: [
    { q: "h", n: [150, 900], text: "Precisamos de armazenagem para {n} pallets em {a}, com giro mensal e controle de lote. Orçamento aprovado, queremos decidir essa semana." },
    { q: "m", n: [200, 1200], text: "Estamos avaliando um CD terceirizado em {a}. Hoje temos {n} pallets e o volume está crescendo. Podem enviar uma proposta?" },
    { q: "l", n: [1, 1], text: "Olá, quanto custa guardar mercadoria? Tenho pouco estoque." },
  ],
  "Last mile": [
    { q: "h", n: [80, 400], text: "Temos {n} entregas por dia em {a} e região e precisamos de um parceiro de last mile com rastreio em tempo real. Contrato recorrente, preciso fechar este mês." },
    { q: "m", n: [30, 200], text: "Quero cotar entrega expressa hoje, urgente: {n} pacotes de {a} para {b}." },
    { q: "l", n: [10, 10], text: "Oi! Vocês entregam para consumidor final? Sou lojista pequeno, uns {n} pedidos por semana." },
  ],
  "Carga refrigerada": [
    { q: "h", n: [5, 30], text: "Preciso transportar {n} toneladas de alimentos congelados de {a} para {b}, com temperatura controlada, toda semana. Quero contratar ainda este mês." },
    { q: "m", n: [1, 1], text: "Bom dia, vocês têm baú refrigerado? Urgente: a carga sai hoje de {a}." },
    { q: "l", n: [1, 1], text: "Só curiosidade: quanto sai um frete refrigerado?" },
  ],
  "Logística reversa": [
    { q: "h", n: [8, 45], text: "Queremos estruturar logística reversa de embalagens para nossas {n} lojas em {a}. Podemos marcar uma reunião com a diretoria?" },
    { q: "l", n: [1, 1], text: "Como funciona logística reversa de eletrônicos?" },
  ],
  "Comércio exterior": [
    { q: "h", n: [3, 12], text: "Precisamos de apoio com desembaraço aduaneiro e transporte de containers do Porto de Santos até {a}. São {n} containers por mês. Preciso de proposta." },
    { q: "m", n: [1, 1], text: "Vi o site de vocês. Trabalham com importação? Gostaria de conversar." },
  ],
}

const SERVICE_WEIGHTS: [Service, number][] = [
  ["Frete rodoviário", 34],
  ["Armazenagem", 18],
  ["Last mile", 16],
  ["Carga refrigerada", 14],
  ["Logística reversa", 8],
  ["Comércio exterior", 10],
]

const CHANNEL_WEIGHTS: [Channel, number][] = [
  ["WhatsApp", 45],
  ["Site", 25],
  ["E-mail", 15],
  ["Telefone", 8],
  ["Indicação", 7],
]

function weighted<T>(rng: Rng, list: [T, number][]): T {
  const total = list.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  for (const [item, w] of list) {
    r -= w
    if (r <= 0) return item
  }
  return list[list.length - 1][0]
}

export function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

export function homeCityFor(rng: Rng) {
  return pick(rng, HOME_CITIES)
}

export function fakePhone(rng: Rng, ddd: number): string {
  const a = between(rng, 1000, 9999)
  const b = between(rng, 1000, 9999)
  return `(${ddd}) 90${String(a).slice(0, 3)}-${b}`
}

export function fakeEmail(name: string, company: string): string {
  const [first, ...rest] = name.split(" ")
  const last = rest[rest.length - 1] ?? ""
  return `${slug(first)}${last ? `.${slug(last)}` : ""}@${slug(company)}.exemplo.com.br`
}

export function generateContact(rng: Rng = Math.random): IncomingContact {
  const service = weighted(rng, SERVICE_WEIGHTS)
  const channel = weighted(rng, CHANNEL_WEIGHTS)
  const qRoll = rng()
  const quality: Quality = qRoll < 0.3 ? "h" : qRoll < 0.62 ? "m" : "l"
  const pool = TEMPLATES[service]
  const matching = pool.filter((t) => t.q === quality)
  const tpl = pick(rng, matching.length ? matching : pool)

  const a = pick(rng, ROUTE_CITIES)
  let b = pick(rng, ROUTE_CITIES)
  while (b === a) b = pick(rng, ROUTE_CITIES)
  const n = between(rng, tpl.n[0], tpl.n[1])

  const message = tpl.text
    .replace("{a}", a)
    .replace("{b}", b)
    .replace(/\{n\}/g, String(n))

  const name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`
  const company = pick(rng, COMPANIES)
  const home = homeCityFor(rng)

  return {
    name,
    company,
    role: pick(rng, ROLES),
    channel,
    message,
    service,
    city: `${home.name}/${home.uf}`,
    phone: fakePhone(rng, home.ddd),
    email: fakeEmail(name, company),
  }
}

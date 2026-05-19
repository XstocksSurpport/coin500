export type TradeStrategy = "short" | "long" | "spot";

export const TRADE_STRATEGIES: {
  id: TradeStrategy;
  label: string;
}[] = [
  { id: "short", label: "\u7b56\u7565\u505a\u7a7a" },
  { id: "long", label: "\u7b56\u7565\u505a\u591a" },
  { id: "spot", label: "\u7b56\u7565\u73b0\u8d27" },
];

export interface TradingAgent {
  id: string;
  name: string;
  provider: string;
}

/** Popular trading / agent models */
export const TRADING_AGENTS: TradingAgent[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "claude-sonnet", name: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek" },
  { id: "gemini-2", name: "Gemini 2.0 Pro", provider: "Google" },
  { id: "grok-2", name: "Grok-2", provider: "xAI" },
  { id: "qwen-max", name: "Qwen2.5-Max", provider: "Alibaba" },
  { id: "llama-3.3", name: "Llama 3.3 70B", provider: "Meta" },
  { id: "mistral-large", name: "Mistral Large 2", provider: "Mistral" },
  { id: "o1", name: "OpenAI o1", provider: "OpenAI" },
  { id: "aixbt", name: "AIXBT Agent", provider: "Virtuals" },
];

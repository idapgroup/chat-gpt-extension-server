import {loadSummarizationChain} from "langchain/chains";
import {OpenAI} from "langchain/llms";
import {Document} from "langchain/document";
import {PromptTemplate} from "langchain/prompts";

const PROMPT = PromptTemplate.fromTemplate(`
You are an AI assistant providing helpful advice.
You are given the following extracted parts of a long document. Summarize text:
`);

const COMBINE_PROMPT = PromptTemplate.fromTemplate(`
Please return the title for this document in one sentence
`)

export const makeSummarizationChain = async (docs: Document[]) => {
  console.log(docs.length)
  const chain = loadSummarizationChain(new OpenAI({ temperature: 0 }), {
    prompt: PROMPT,
    combinePrompt: COMBINE_PROMPT
  });
  return await chain.call({
    input_documents: docs,
  });
}

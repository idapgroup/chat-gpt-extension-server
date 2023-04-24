import {NextApiRequest, NextApiResponse} from "next";
import {PuppeteerWebBaseLoader} from "langchain/document_loaders";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {OpenAIEmbeddings} from "langchain/embeddings";
import {pinecone} from "../../utils/pinecone-client";
import {PINECONE_INDEX_NAME, PINECONE_NAME_SPACE} from "../../config/pinecone";
import {PineconeStore} from "langchain/vectorstores";
import {v4 as uuid} from 'uuid';
import NextCors from "nextjs-cors";
import {customWebLoaderByUrl} from "../../utils/customWebLoaderByUrl";
import {makeSummarizationChain} from "../../utils/makeSummarizationChain";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  await NextCors(req, res, {
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200,
  });
  const {url} = req.body;
  if (!url) {
    return res.status(400).json({message: 'Bad request'});
  }

  try {
    const docs = await customWebLoaderByUrl(url);

    if(!docs.length){
      return res.status(400).json({message: 'Cannot parse'});
    }

    const title = docs[0].pageContent.split('\n')[0];

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const splitted = await textSplitter.splitDocuments(docs);

    const embeddings = new OpenAIEmbeddings();

    const id = uuid();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    const withMetadata = splitted.map(({metadata, pageContent}) => ({pageContent, metadata: {...metadata, id}}))
    //embed the PDF documents
    await PineconeStore.fromDocuments(withMetadata, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    return res.json({storeId: id, title});

  } catch (e) {
    console.log(e)
    res.status(400).json({message: 'Cannot create vector'})
    return
  }
}

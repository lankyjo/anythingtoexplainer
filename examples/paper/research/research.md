# Retrieval-Augmented Generation - sample research note

Compact fact source for the 30-second sample film. Every on-screen number and term below has a
source URL.

## What it is

- Retrieval-augmented generation (RAG) couples a language model with a document index: the model
  first retrieves passages relevant to a question, then writes its answer from them.
  Source: Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
  NeurIPS 2020 - https://arxiv.org/abs/2005.11401
- The term and the method come from that 2020 paper by Facebook AI Research (now Meta AI).
  Source: same.
- Models answer from parametric memory (what they learned in training); RAG adds non-parametric
  memory (an external index that can be updated without retraining).
  Source: same paper, section 1.

## The pipeline

1. Index - documents are split into chunks, embedded into vectors, and stored in a vector store.
   Source: Lewis et al. 2020 (retriever/index description) - https://arxiv.org/abs/2005.11401
2. Retrieve - the question is embedded and matched against the index; the closest chunks come back.
   Source: same, section 2 (dense passage retrieval).
3. Generate - the model writes the answer from the retrieved passages, so claims can carry
   citations.
   Source: same, section 2 (generator) and section 4 (human evaluation of factual grounding).

## Numbers used on screen

- 2020 - the year the RAG paper was published. Source: https://arxiv.org/abs/2005.11401
- 3 - pipeline steps (index, retrieve, generate). Source: same paper's task framing.

## Not used (kept as unused, marked illustrative)

- Similarity scores, chunk sizes and latency figures would be illustrative only; the sample shows
  no such numbers.

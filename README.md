# 🧠 Insurance Policy AI (RAG System)

> Understand your insurance policy in seconds using AI.\
> Upload → Ask → Get accurate, explainable answers with source
> references.

------------------------------------------------------------------------

## 🚀 Overview

**Insurance Policy AI** is a domain-specific **Retrieval-Augmented
Generation (RAG)** system that helps users understand complex insurance
documents.

------------------------------------------------------------------------

## 🎯 Problem

Insurance policies are: - Long and complex (20--100 pages) - Filled with
legal jargon - Difficult for non-experts to understand

------------------------------------------------------------------------

## 💡 Solution

This system uses **LLMs + Vector Search** to: 1. Parse insurance
documents 2. Retrieve relevant clauses 3. Generate accurate answers

------------------------------------------------------------------------

## 🧩 Features

### ✅ Core

-   Upload insurance policy (PDF)
-   Ask questions in natural language
-   Context-aware answers
-   Source references

### 🚀 Advanced (Planned)

-   Coverage validation
-   Risk analysis
-   Policy summary
-   Clause highlighting
-   Multi-policy comparison

------------------------------------------------------------------------

## 🏗️ Architecture

Frontend (Next.js) ↓ API (NestJS) ↓ RAG Module → Retriever → Vector DB ↓
LLM (OpenAI) ↓ PostgreSQL + Redis

------------------------------------------------------------------------

## ⚙️ Tech Stack

-   NestJS
-   LangChain
-   OpenAI
-   PostgreSQL
-   Chroma
-   Redis
-   Turborepo
-   Docker

------------------------------------------------------------------------

## ▶️ Getting Started

``` bash
pnpm install
pnpm turbo run dev
docker-compose up
```

------------------------------------------------------------------------

## 📌 Author

Jay Movaliya

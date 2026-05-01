import { Document, VectorSearchResult } from '../types';

export class VectorService {
  private vectorSize: number = 128;

  public generateVector(text: string): number[] {
    const vector: number[] = [];
    const words = text.toLowerCase().split(/\s+/);
    const seed = this.hashText(text);
    
    for (let i = 0; i < this.vectorSize; i++) {
      let value = (Math.sin(seed + i * 0.1) + 1) / 2;
      
      for (let j = 0; j < words.length; j++) {
        const wordHash = this.hashText(words[j]);
        value += (Math.sin(wordHash + i * 0.05) + 1) / 4;
      }
      
      vector.push(Math.min(1, value / 2));
    }
    
    return this.normalize(vector);
  }

  public cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  public search(
    query: string,
    documents: Document[],
    topK: number = 10
  ): VectorSearchResult[] {
    const queryVector = this.generateVector(query);
    
    const results: VectorSearchResult[] = documents.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryVector, doc.vector)
    }));
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  public findRelatedDocuments(
    document: Document,
    documents: Document[],
    topK: number = 5
  ): string[] {
    const results = this.search(
      document.content,
      documents.filter(d => d.id !== document.id),
      topK
    );
    return results.map(r => r.document.id);
  }

  private hashText(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }
}

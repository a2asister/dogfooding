const GRAPHQL_URL = 'http://localhost:47823/graphql';

async function request(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}

export async function fetchComments() {
  const query = `
    query {
      comments {
        id
        content
        author
        parentId
        materializedPath
        depth
        likes
        createdAt
        children {
          id
          content
          author
          parentId
          materializedPath
          depth
          likes
          createdAt
          children {
            id
            content
            author
            parentId
            materializedPath
            depth
            likes
            createdAt
            children {
              id
              content
              author
              parentId
              materializedPath
              depth
              likes
              createdAt
            }
          }
        }
      }
    }
  `;
  const data = await request(query);
  return data.comments;
}

export async function createComment(content, author, parentId = null) {
  const query = `
    mutation($input: CreateCommentInput!) {
      createComment(input: $input) {
        id
        content
        author
        parentId
        materializedPath
        depth
        likes
        createdAt
      }
    }
  `;
  const input = { content, author };
  if (parentId) {
    input.parentId = parentId;
  }
  const variables = { input };
  const data = await request(query, variables);
  return data.createComment;
}

export async function deleteComment(id) {
  const query = `
    mutation($id: ID!) {
      deleteComment(id: $id)
    }
  `;
  const variables = { id };
  const data = await request(query, variables);
  return data.deleteComment;
}

export async function likeComment(id) {
  const query = `
    mutation($id: ID!) {
      likeComment(id: $id) {
        id
        likes
      }
    }
  `;
  const variables = { id };
  const data = await request(query, variables);
  return data.likeComment;
}

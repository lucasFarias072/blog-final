

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Listar as postagens do modelo Post com critérios de ordenação
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter as postagens do modelo Post
app.get('/api/db/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Listar comentários pelo código da postagem passada em req.params
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar postagem (não é o comentário)
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, civilization, figure, continent } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: título, conteúdo e autor' 
      });
    }
    
    if (typeof civilization !== 'boolean' || typeof figure !== 'boolean') {
      return res.status(400).json({ 
        error: 'Campos civilization e figure devem ser boolean' 
      });
    }
    
    if (!continent || continent === 'void') {
      return res.status(400).json({ 
        error: 'Por favor, selecione um continente válido' 
      });
    }
    
    // console.log('Dados recebidos:', { title, content, author, civilization, figure, continent });
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        author,
        civilization,
        figure,
        continent
      }
    });
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Encontrar postagem para atualizar
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar postagem
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        content,
        author
      }
    });
    
    res.json(post);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Deletar postagem
app.delete('/api/posts/:id', async (req, res) => {
  try {
    // Primeiro deletar todos os comentários da postagem
    await prisma.comment.deleteMany({
      where: { postId: parseInt(req.params.id) }
    });
    
    // Depois deletar a postagem
    await prisma.post.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ message: 'Post deletado com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Criar comentário
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { content, author } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        content,
        author,
        postId: parseInt(req.params.id)
      }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar comentário
app.delete('/api/comments/:id', async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Atualizar like
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    const targetPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!targetPost) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Return the current state of number of likes
    // if (targetPost.liked) {
    //   // return res.status(400).json({ error: 'Post já foi curtido' });
    //   return res.json({like: targetPost.like})
    // }

    // Update (if nothing stops it previously)
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        like: { increment: 1 },
        liked: true
      }
    });
    
    res.json({ like: updatedPost.like });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros do Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

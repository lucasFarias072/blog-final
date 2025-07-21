

const API_URL = 'http://localhost:3000/api';

const people = [
    'Antônio', 'Bento', 'Chico', 'Demerval', 'Eleonor',
    'Figueiredo', 'Geraldo', 'Humberto', 'Inocêncio', 'James',
    'Kleiton', 'Leôncio', 'Mario', 'Neivan', 'Orlando', 'Pereira',
    'Queiroz', 'Raimundo', 'Salomão', 'Timóteo', 'Urmênico',
    'Veloso', 'Wagner', 'Xavier', 'Yago', 'Zé Filho'
];

const lastNames = [
    'Almeida', 'Boticário', 'Calisto', 'Damasco', 'Elfrates',
    'Ferreira', 'Germânico', 'Herdeiro', 'Inácio', 'Jericó',
    'Kalisto', 'Lemos', 'Madeira', 'Nogueira', 'Otorrino', 'Palmeira',
    'Quilombo', 'Reitor', 'Salvador', 'Tigreso', 'Uberlano',
    'Valadares', 'Wall Ferraz', 'Xelemeu', 'Yogurt', 'Zaquarias'
];

const talking = [
    // Conformidade
    "Tudo bem por mim", "Sem problemas", "Está certo", "Concordo plenamente", "É justo", "Pode ser",
    "Faz sentido", "Está combinado", "Não vejo objeção", "Vamos nessa",

    // Surpresa
    "Sério isso?", "Não acredito!", "Caramba!", "Que coisa!", "Nossa!", "Mentira!", "Tá brincando?",
    "É mesmo?", "Como assim?", "Uau!",

    // Reprovação
    "Isso não se faz", "Totalmente inaceitável", "Não gostei disso", "Isso está errado", "Francamente...",
    "Que decepção", "Muito ruim da sua parte", "Inadmissível!", "Fiquei chateado com isso", "Não dá pra aceitar",

    // Crítica
    "Não foi uma boa escolha", "Poderia ter feito melhor", "Faltou bom senso aí", "Isso precisa ser revisto",
    "Não concordo com esse método", "Foi precipitado", "Essa decisão foi questionável", "Péssima execução",
    "Ficou a desejar", "Está muito mal planejado",

    // Ponderação
    "Vamos analisar com calma", "Depende do ponto de vista", "Tem dois lados essa questão",
    "Precisamos refletir melhor", "Talvez não seja tão simples", "É preciso avaliar bem",
    "Vamos considerar todas as opções", "Isso merece atenção", "Tem que ver os prós e contras",
    "Há nuances nisso"
];

const backgrounds = 'a.b.c.d.e.f.g.h.i.j.k.l.m'.split('.');

const emojis = [
    '🤔', '😉', '🤩', '😊',
    '😎', '😆', '🙋‍♂️', '🥰', '😨',
    '😑', '😀', '👀', '😏', '😟',
    '🙂', '😠', '😁', '😧', '😌',
    '😮', '😐', '😳', '😞', '🤗'
];

const getInterval = (tail, head) => {return Math.floor(Math.random() * (head - tail) + tail)};

const buildEmojiTable = (container, array, css) => {
    let html = `<div class="flex row going-left gap ${css}" style="width: 50%; margin-left: 1rem">`;
    
    for(let i = 0; i < array.length; i++) {
        html += `\n<span onclick="injectContent('${container}', '${array[i]}')">${array[i]}</span>`;
    }
    html += '</div>';
    return html;
};

const injectContent = (container, content) => {
    document.querySelector(`.${container}`).value += content;
};

document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
});

async function loadPosts() {
    const container = document.getElementById('posts');
    const errorContainer = document.getElementById('posts-warner');
    
    errorContainer.innerHTML = '';
    
    container.innerHTML = '<div class="feat-loading">Carregando posts...</div>';

    try {
        const response = await fetch(`${API_URL}/posts`);
        
        if (!response.ok) throw new Error('Erro ao carregar posts');
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            container.innerHTML = '<div class="feat-loading">Nenhum post encontrado</div>';
            return;
        }

        const formForComment = 'comment-form';
        const formForUpdate = 'edit-post-form';

        // Construir HTML dos posts
        let html = '';
        
        posts.forEach(post => {
            const postTitle = `<h3 class="post-title flex row going-left">${post.title}</h3>`;
            
            const postAuthor = `
            <div class="post-meta flex row going-left">
                <span class="who">Por ${post.author} em ${new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>`;
            
            const postContent = `<div class="post-content">${post.content}</div>`;

            const postAdmin = `
            <div class="post-del flex row going-right">
                <button onclick="editPost('${formForUpdate}', ${post.id})" class="btn-post-edit">✏️</button>
                <button onclick="deletePost(${post.id})" class="btn-post-del">❌</button>
            </div>`;
            
            const postEachComment = `
            <div class="comments">
                <div class="flex row going-left">
                    <h5 class="comment-item">Comentários</h5>
                    <span class="comment-counter">${post.comments.length}</span>
                </div>
                
                ${post.comments.map(comment => `
                <div class="comment">
                    <div class="comment-meta">
                        <div class="comment-del flex row going-right">
                            <button onclick="deleteComment(${comment.id})" class="btn-comment-del">❌</button>
                        </div>
                        <span class="who">${comment.author} - ${new Date(comment.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="comment-itself">${comment.content}</div>
                </div>
                `).join('')}
            </div>`;

            const commentForm = `
            <form id="${formForComment}" onsubmit="appendComment(event, ${post.id})">
                <div class="flex column going-left">
                    <textarea class="comment-text-area text-area-${post.id}" placeholder="responda à esta postagem"></textarea>
                    <div class="submit-comment-box flex column gap">
                        <input type="text" id="comment-author" placeholder="informe seu nome">
                        <button id="btn-post-comment">comentar</button>
                    </div>
                </div>
            </form>`;
            
            html += `
            <div class="post-frame flex column" style="background-image: url('../static/img/banner-${backgrounds[getInterval(0, backgrounds.length)]}.png');">
                ${postAdmin}
                ${postTitle}
                ${postAuthor}
                ${postContent}
                <div class="post-panel flex row going-left">
                    <button onclick="incrementLike(${post.id}, this)" class="like mg-left">❤️</button>
                    <span class="like-amount mg-left">${post.like}</span>
                </div>
                <div class="flex row going-left gap">
                    ${buildEmojiTable(`text-area-${post.id}`, emojis, 'emoji')}
                </div>
                ${commentForm}
                ${postEachComment}
            </div>`;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        errorContainer.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
        container.innerHTML = '';
    }
};

async function filterPosts(formId) {
    document.getElementById(formId).addEventListener('change', async (e) => {
        e.preventDefault()
        
        const selectedConcept = document.querySelector('input[name="concept-query"]:checked')?.value;
        const civilization = selectedConcept.toLowerCase().trim() === 'civilization';
        const figure = selectedConcept.toLowerCase().trim() === 'figure';
        const continent = document.getElementById('continents-query').value;

        const container = document.getElementById('posts');
        const errorContainer = document.getElementById('posts-warner');
        errorContainer.innerHTML = '';
        const formForComment = 'comment-form';
        const formForUpdate = 'edit-post-form';
        let html = '';

        try {
            const response = await fetch(`${API_URL}/posts`);
            
            if (!response.ok) throw new Error('Erro ao carregar posts');
            
            const posts = await response.json();
            
            if (posts.length === 0) {
                container.innerHTML = '<div class="feat-loading">Nenhum post encontrado</div>';
                return;
            }

            const postsFound = posts.filter(post => 
                post.civilization === civilization && post.figure === figure && post.continent === continent
            );

            if (postsFound.length === 0) {
                container.innerHTML = '<div id="posts"><h2>Nenhum post relacionado foi encontrado</h2></div>';
                return;
            } else {
                postsFound.forEach(post => {
                const postTitle = `<h3 class="post-title flex row going-left">${post.title}</h3>`;
                
                const postAuthor = `
                <div class="post-meta flex row going-left">
                    <span class="who">Por ${post.author} em ${post.createdAt.split("T")[0]}</span>
                </div>`;
                
                const postContent = `<div class="post-content">${post.content}</div>`;

                const postAdmin = `
                <div class="post-del flex row going-right">
                    <button onclick="editPost('${formForUpdate}', ${post.id})" class="btn-post-edit">✏️</button>
                    <button onclick="deletePost(${post.id})" class="btn-post-del">❌</button>
                </div>`;
                
                const postEachComment = `
                <div class="comments">
                    <div class="flex row going-left">
                        <h5 class="comment-item">Comentários</h5>
                        <span class="comment-counter">${post.comments.length}</span>
                    </div>
                    
                    ${post.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-meta">
                            <div class="comment-del flex row going-right">
                                <button onclick="deleteComment(${comment.id})" class="btn-comment-del">❌</button>
                            </div>
                            <span class="who">${comment.author} - ${comment.createdAt.split("T")[0]}</span>
                        </div>
                        <div class="comment-itself">${comment.content}</div>
                    </div>
                    `).join('')}
                </div>`;

                const commentForm = `
                <form id="${formForComment}" onsubmit="appendComment(event, ${post.id})">
                    <div class="flex column going-left">
                        <textarea class="comment-text-area text-area-${post.id}" placeholder="responda à esta postagem"></textarea>
                        <div class="submit-comment-box flex column going-left gap mg-left">
                            <input type="text" id="comment-author" placeholder="informe seu nome">
                            <button id="btn-post-comment">comentar</button>
                        </div>
                    </div>
                </form>`;
                
                html += `
                <div class="post-frame flex column" style="background-image: url('../static/img/banner-${backgrounds[getInterval(0, backgrounds.length)]}.png');">
                    ${postAdmin}
                    ${postTitle}
                    ${postAuthor}
                    ${postContent}
                    <div class="post-panel flex row">
                        <button onclick="incrementLike(${post.id}, this)" class="like mg-left">❤️</button>
                        <span class="like-amount mg-left">${post.like}</span>
                    </div>
                    <div class="flex row going-left gap">
                        ${buildEmojiTable(`text-area-${post.id}`, emojis, 'emoji')}
                    </div>
                    ${commentForm}
                    ${postEachComment}
                </div>`;
                    
            });
        }
        
        container.innerHTML = html;

        } catch (error) {
            errorContainer.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
            container.innerHTML = '';
        }
    })
};

async function appendPost(formId) {
    document.getElementById(formId).addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const content = document.getElementById('content').value;
        
        const selectedConcept = document.querySelector('input[name="concept"]:checked')?.value;
        
        const civilization = selectedConcept.toLowerCase().trim() === 'civilization';
        const figure = selectedConcept.toLowerCase().trim() === 'figure';
        
        const continent = document.getElementById('continents').value;
        
        if (!selectedConcept) {
            alert('Por favor, selecione se é sobre Civilização ou Figura histórica');
            return;
        }
        
        if (continent === 'void') {
            alert('Por favor, selecione um continente');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, author, content, civilization, figure, continent })
            })
            
            if (response.ok) {
                document.getElementById(formId).reset();
                loadPosts();
            }
        } catch (error) {
            console.error('Erro ao criar post:', error);
        }
    })
};

async function appendComment(event, postId) {
    event.preventDefault();
    
    const form = event.target;
    const author = form.querySelector('#comment-author').value || 'Desconhecido';
    const content = form.querySelector('.comment-text-area').value || `${author} está sem argumentos!`;
    
    try {
        await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ author, content })
        });
        
        form.reset();
        loadPosts();
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
    }
};

async function incrementLike(postId, tag) {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        // Atualiza o número na tela
        const likeSpan = tag.nextElementSibling;
        likeSpan.textContent = data.like;
    } catch (error) {
        console.error('Erro:', error);
    }
};

async function deletePost(id) {
    if (confirm('Você deseja deletar esta postagem?')) {
        try {
            await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE'
            })
            loadPosts();
        } catch (error) {
            console.error('Erro ao deletar postagem:', error);
        }
    }
};

async function deleteComment(id) {
    if (confirm('Você deseja deletar este comentário?')) {
        try {
            await fetch(`${API_URL}/comments/${id}`, {
                method: 'DELETE'
            })
            loadPosts();
        } catch (error) {
            console.error('Erro ao deletar comentário:', error);
        }
    }
};

async function editPost(formId, postId) {
    try {
        // Captura os dados referente ao id passado dinamicamente
        const response = await fetch(`${API_URL}/posts/${postId}`);
        const post = await response.json();
        
        // Passa aos campos do formulário de edição, os dados do objeto achado
        document.getElementById('edit-post-id').value = post.id;
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-author').value = post.author;
        document.getElementById('edit-content').value = post.content;
        
        // Marca os inputs radio de acordo com o que foi achado no objeto
        if (post.civilization) {
            document.getElementById('edit-civilization').checked = true;
        } else if (post.figure) {
            document.getElementById('edit-figure').checked = true;
        }
        
        // Mesma coisa que os inputs ratio, só que com o dropdown agora
        document.getElementById('edit-continents').value = post.continent;
        
        // Esconde os formulários não usáveis e deixa somente o de atualização
        document.getElementById('form-for-new-post').classList.add('vanished');
        document.getElementById('filtering-form').classList.add('vanished');
        document.getElementById('form-for-edit-post').classList.remove('vanished');

        document.getElementById(formId).addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const postId = document.getElementById('edit-post-id').value;
            const title = document.getElementById('edit-title').value;
            const author = document.getElementById('edit-author').value;
            const content = document.getElementById('edit-content').value;
            
            const postData = { title, author, content };
            
            // Chama a rota que atualiza, passando o que está nos campos do formulário
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            
            // Requisição deu certo: atualiza a página
            if (response.ok) {
                location.reload();
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar post:', error);
    }
};

function cancelEdit() {
    document.getElementById('form-for-new-post').classList.remove('vanished');
    document.getElementById('filtering-form').classList.remove('vanished');
    document.getElementById('form-for-edit-post').classList.add('vanished');
};

const delayForCommentFetchAttemp = 1000;
const delayForLikeFetchAttemp = 1000;

async function feedWithComments() {
    let counter = 0;
    
    const loopForComments = setInterval(async() => {
        if (counter === 7) {
            counter = 0;
            clearInterval(loopForComments);
        }
        
        // Dificultar chamada de requisições
        let token = Math.random();
        const conditionToFetch = token > 0.98 && counter % 2 === 1 || token < 0.12 && counter % 2 === 0;
        
        if (conditionToFetch) {
            // Quando passa, cria os valores pros campos, que farão parte das postagens
            const author = `${people[getInterval(0, people.length)]} ${lastNames[getInterval(0, lastNames.length)]}`;
            const content = talking[getInterval(0, talking.length)];

            try {
                const response = await fetch(`${API_URL}/db/posts`);
                if (!response.ok) throw new Error('Erro ao carregar posts');
                const posts = await response.json();
                const postsIds = posts.map(i => i.id);
                const randomPostA = postsIds[getInterval(0, postsIds.length)];
                // Envia a postagem
                const responseAboutComment = await fetch(`${API_URL}/posts/${randomPostA}/comments`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ author, content })
                })
                if (responseAboutComment.ok) {
                    loadPosts();
                }

            } catch (error) {
                console.error('Erro:', error);
            }
        } else {
            console.log('atividade negada: criar comentário');
        }
        
        counter++;
    }, delayForCommentFetchAttemp)
};

async function feedWithLikes() {
    let counter = 0;
    
    const loopForLikes = setInterval(async() => {
        if (counter === 7) {
            counter = 0;
            clearInterval(loopForLikes);
        }
        
        let token = Math.random()
        const conditionToFetchLike = token > 0.95 && counter % 2 === 1 || token < 0.15 && counter % 2 === 0

        if (conditionToFetchLike) {
            try {
                const response = await fetch(`${API_URL}/db/posts`);
                if (!response.ok) throw new Error('Erro ao carregar posts');
                const posts = await response.json();
                const postsIds = posts.map(i => i.id);
                
                const randomPostB = postsIds[getInterval(0, postsIds.length)];
                
                const responseAboutLike = await fetch(`${API_URL}/posts/${randomPostB}/like`, {
                    method: 'PUT',
                })

                if (responseAboutLike.ok) {
                    console.log(responseAboutLike);
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        } else {
            console.log('atividade negada: dar like');
        }

        counter++;
    }, delayForLikeFetchAttemp)
};

appendPost('post-form');
filterPosts('filtering-form');

let engine
const enableActivityEngine = document.getElementById('activity-engine')
enableActivityEngine.addEventListener('click', () => {
    if (localStorage.getItem('engineActions') >= 7) {
        localStorage.setItem('engineActions', 0)
    }
    let status = enableActivityEngine.textContent.includes('🔴')
    if (status) {
        enableActivityEngine.textContent = 'Desabilitar atividade 🟢'
    } else {
        enableActivityEngine.textContent = 'Habilitar atividade 🔴'
    }
    status = enableActivityEngine.textContent.includes('🔴')
    if (!status) {
        engine = setInterval(() => {
            let triggerForLike = Math.random() > 0.6
            let triggerForComment = Math.random() > 0.7
            triggerForLike ? feedWithLikes() : console.log('tentando engatilhar: feedWithLikes')
            triggerForComment ? feedWithComments() : console.log('tentando engatilhar: feedWithComments')
        }, 1000)
    } else {
        clearInterval(engine)
    }
})

const engineController = setInterval(() => {
    if (localStorage.getItem('engineActions') === null) {
        localStorage.setItem('engineActions', 0)
    } else {
        if (localStorage.getItem('engineActions') >= 7) {
            clearInterval(engineController)
        }
    }
    const activityEngine = document.getElementById('activity-engine')
    if (activityEngine.textContent.includes('🔴') && localStorage.getItem('engineActions') < 7) {
        document.querySelector('#activity-engine').click()
        localStorage.setItem('engineActions', parseInt(localStorage.getItem('engineActions')) + 1)
    }
}, 100)

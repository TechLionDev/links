import PocketBase from 'pocketbase';
import middleware from '@/app/middleware';

const url = 'https://url-shortener.pockethost.io/'
const pb = new PocketBase(url)

export async function GET(request: Request){
    await middleware(request, null, null)
    const { searchParams } = new URL(request.url)
    let url = decodeURIComponent(searchParams.get('url') ?? '')
    let slug = searchParams.get('slug')
    if(!url) return Response.json({ error: 'No url provided' })
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`
    }
    if (!(await doesntExist(slug))){
        slug = await generateSlug()
    }
    if (!slug) {
        slug = await generateSlug()
    }
    if (await exists(url)) {
        let shortenedUrl = await fetch(url)
        return Response.json(shortenedUrl)
    }
    let shortenedUrl = await pb.collection('urls').create({
        originalUrl: url,
        shortUrlSlug: slug
    })

    let response = Response.json(shortenedUrl)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
}

async function generateSlug(){
    let shortUrl;

  do {
    shortUrl = generateRandomString(4);
  } while (!(await doesntExist(shortUrl)));

  return shortUrl;
}

async function exists(url: string) {
    const pbrecords = await pb.collection('urls').getFullList()
    for (let i = 0; i < pbrecords.length; i++) {
        if (pbrecords[i].originalUrl == url) {
            return true
        }
    }
    return false
}

async function fetch(url: string) {
    const pbrecords = await pb.collection('urls').getFullList()
    for (let i = 0; i < pbrecords.length; i++) {
        if (pbrecords[i].originalUrl == url) {
            return pbrecords[i]
        }
    }
    return false
}

async function doesntExist(slug: string | null) {
    const pbrecords = await pb.collection('urls').getFullList()
    for (let i = 0; i < pbrecords.length; i++) {
        if (pbrecords[i].shortUrlSlug == slug) {
            return false
        }
    }
    return true
}

function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
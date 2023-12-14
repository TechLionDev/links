import PocketBase from 'pocketbase';

const url = 'https://url-shortener.pockethost.io/'
const pb = new PocketBase(url)

export async function GET(request: Request){
    const { searchParams } = new URL(request.url)
    let url = searchParams.get('url')
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

    return Response.json(shortenedUrl)
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
'use client';

import { useState, useEffect } from "react";
import PocketBase from 'pocketbase';

const url = 'https://url-shortener.pockethost.io/'
const pb = new PocketBase(url)

interface PageProps {
    params: {
        slug: string;
    };
}

const RedirectURL = ({ params }: PageProps) => {
    const [slug, setslug] = useState(params.slug);
    const [redirected, setRedirected] = useState(false);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            if (dots.length < 3) {
                setDots(dots + '.');
            } else {
                setDots('');
            }
        }, 100);
        return () => clearInterval(interval);
    }, [dots]);

    useEffect(() => {
        (async () => {
            const pbrecords = await pb.collection('urls').getFullList()
            for (let i = 0; i < pbrecords.length; i++) {
                if (pbrecords[i].shortUrlSlug == slug) {
                    setRedirected(true);
                    window.location.href = pbrecords[i].originalUrl;
                    break;
                }
            }
            if (!redirected) {
                window.location.href = '/status/404';
            }
        })();
    }, []);
    return (
        <>
            <div className="bg-black text-white text-center h-screen font-bold flex justify-center items-center text-3xl">
                Redirecting{dots}
            </div>
        </>
    );
}

export default RedirectURL;
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom"

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map((item) => item.text.split(' ').length)
    words.map(word => (total += word))
    return total;
  }, 0)
  const readTime = Math.ceil(totalWords / 200)
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR
    }
  );

  return (
    <div>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>
      <div className={styles.container}>
        <Header />
      </div>
      <img className={styles.banner} src={post.data.banner.url} />
      <div className={commonStyles.container}>
        <div>
          <h1>{post.data.title}</h1>
          <div>
            <p>{formatedDate}</p>
            <p>{post.data.author}</p>
            <p>{`${readTime} min`}</p>
          </div>
        </div>
        <div>
          {post.data.content.map((p) => (<article key={p.heading}>
            <h2>{p.heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(p.body) }} />
          </article>))}
        </div>
      </div>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("post");

  const paths = posts.results.map((post) => ({
    params: { slug: post.uid }
  }))
  return { paths, fallback: true }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: RichText.asText(response.data.title),
      subtitle: RichText.asText(response.data.subtitle),
      author: RichText.asText(response.data.author),
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(content => {
        return {
          heading: RichText.asText(content.heading),
          body: [...content.body]
        }
      })
    }
  }
  return {
    props: {
      post
    }
  }
};

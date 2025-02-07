import React from 'react';
import { discordLink, inviteLink } from '../utils/consts';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import './JoinCommunity.less';

export const JoinCommunity: React.FC = React.memo(() => {
  return (
    <div className="join-community">
      <h3>
        <Translate>Join the community</Translate>
      </h3>
      <p>
        <Translate>
          Engage with our ever-growing community to get the latest updates,
          product support, and more.
        </Translate>
      </p>

      <div>
        <Link
          className="button button--primary button--lg"
          href={inviteLink}
          data-umami-event="joingroup"
          data-tianji-event="joingroup"
        >
          <Translate>Join Tailchat Group</Translate>
        </Link>
      </div>

      <div>
        <Link
          className="button button--primary button--lg"
          href={discordLink}
          data-umami-event="joindiscord"
          data-tianji-event="joindiscord"
        >
          <Translate>Join Discord</Translate>
        </Link>
      </div>

      <div className="producthunt">
        <a
          href="https://www.producthunt.com/posts/tailchat?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tailchat"
          target="_blank"
          rel="noreferrer"
          data-umami-event="producthunt"
          data-tianji-event="producthunt"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=382080&theme=light"
            alt="Tailchat - The&#0032;next&#0045;generation&#0032;noIM&#0032;Application&#0032;in&#0032;your&#0032;own&#0032;workspace | Product Hunt"
            style={{ width: 250, height: 54 }}
            width="250"
            height="54"
          />
        </a>
      </div>
    </div>
  );
});
JoinCommunity.displayName = 'JoinCommunity';

import { createSignal, type Component } from 'solid-js';
import type { User } from '../types';
import { followUser, unfollowUser } from '../api';
import { SocialIcon } from './SocialIcon';

interface UserCardProps {
  user: User;
  onFollowChange: (userId: string, isFollowing: boolean, count: number) => void;
  onDragStart: (e: DragEvent, userId: string) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent, userId: string) => void;
  onDragEnd: (e: DragEvent) => void;
  isDragging: boolean;
  isOver: boolean;
}

export const UserCard: Component<UserCardProps> = (props) => {
  const [isFollowing, setIsFollowing] = createSignal(props.user.isFollowing);
  const [followerCount, setFollowerCount] = createSignal(props.user.followerCount);
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [isFlipped, setIsFlipped] = createSignal(false);
  const [flipLocked, setFlipLocked] = createSignal(false);

  const handleMouseEnter = () => {
    if (!flipLocked() && !props.isDragging) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (!flipLocked()) {
      setIsFlipped(false);
    }
  };

  const handleFollowClick = async () => {
    if (isAnimating()) return;
    setIsAnimating(true);
    setFlipLocked(true);

    try {
      if (isFollowing()) {
        const res = await unfollowUser(props.user.id);
        setIsFollowing(res.following);
        setFollowerCount(res.followerCount);
        props.onFollowChange(props.user.id, res.following, res.followerCount);
      } else {
        const res = await followUser(props.user.id);
        setIsFollowing(res.following);
        setFollowerCount(res.followerCount);
        props.onFollowChange(props.user.id, res.following, res.followerCount);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    }

    setIsAnimating(false);
    setTimeout(() => {
      setFlipLocked(false);
    }, 300);
  };

  return (
    <div
      class={`card-container ${props.isDragging ? 'dragging' : ''} ${props.isOver ? 'drop-target' : ''} ${isFlipped() ? 'is-flipped' : ''}`}
      draggable={true}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={(e) => props.onDragStart(e, props.user.id)}
      onDragOver={(e) => props.onDragOver(e)}
      onDrop={(e) => props.onDrop(e, props.user.id)}
      onDragEnd={(e) => {
        props.onDragEnd(e);
        setIsFlipped(false);
        setFlipLocked(false);
      }}
    >
      <div class="card">
        <div class="card-face card-front">
          <img
            src={props.user.avatar}
            alt={props.user.nickname}
            class="card-avatar"
            draggable={false}
            style={{ 'pointer-events': 'none' }}
          />
          <h2 class="card-nickname">{props.user.nickname}</h2>
          <p class="card-name">{props.user.name}</p>
          <p class="card-bio">{props.user.bio}</p>
        </div>

        <div class="card-face card-back">
          <div class="card-section">
            <div class="card-section-title">Experience</div>
            <p class="card-detail-text">{props.user.experience}</p>
          </div>

          <div class="card-section">
            <div class="card-section-title">Location</div>
            <p class="card-detail-text">{props.user.location}</p>
          </div>

          <div class="card-section">
            <div class="card-section-title">Company</div>
            <p class="card-detail-text">{props.user.company}</p>
          </div>

          <div class="card-section">
            <div class="card-section-title">Website</div>
            <p class="card-detail-text">
              <a
                href={props.user.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {props.user.website.replace(/^https?:\/\//, '')}
              </a>
            </p>
          </div>

          <div class="card-section">
            <div class="card-section-title">Skills</div>
            <div class="skills-list">
              {props.user.skills.map((skill) => (
                <span class="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          <div class="card-section">
            <div class="card-section-title">Social</div>
            <div class="social-links">
              {props.user.socialLinks.map((link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="social-link"
                  title={link.platform}
                  onClick={(e) => e.stopPropagation()}
                >
                  <SocialIcon name={link.icon} />
                </a>
              ))}
            </div>
          </div>

          <div class="card-actions">
            <button
              class={`follow-btn ${isFollowing() ? 'following' : ''}`}
              onClick={handleFollowClick}
              disabled={isAnimating()}
            >
              <span>{isFollowing() ? '' : '关注'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path
                  class="check-path"
                  d="M5 12l5 5L20 7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <div class="follow-stats">
              <span class="follow-count">{followerCount()}</span>
              <span>粉丝</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

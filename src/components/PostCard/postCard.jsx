import React, { useContext, useEffect, useState } from "react";
import "./postCard.css";
import { DataContext } from "../../contexts/dataContext";
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";
import { likePostHandler } from "../../utils/likePostHandler";
import { dislikePostHandler } from "../../utils/dislikePostHandler";
import { removeFromBookmarkPostHandler } from "../../utils/removeFromBookmarkHandler";
import { addToBookmarkPostHandler } from "../../utils/bookmarkPostHandler";
import { useNavigate } from "react-router-dom";
import Comment from "../Comment/comment";
import { deletePostHandler } from "../../utils/deletePostHandler";

const PostCard = ({ post }) => {
  const {
    _id,
    content,
    contentLink,
    mediaURL,
    likes,
    comments,
    username,
    createdAt,
  } = post;

  const [userDetails, setUserDetails] = useState({});

  const { dataState, dataDispatch } = useContext(DataContext);
  const { authState } = useContext(AuthContext);

  const navigate = useNavigate();

  const [showCommentSection, setShowCommentSection] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const editClickHandler = () => {
    setShowOptions(false);
  };

  const deleteClickHandler = () => {
    deletePostHandler(authState?.token, _id, dataDispatch);
    setShowOptions(false);
  };

  useEffect(() => {
    setUserDetails(
      dataState?.users?.find((user) => user.username === username)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isliked = () =>
    likes?.likedBy?.filter(({ _id }) => _id === authState?.user?._id)
      ?.length !== 0;

  const isBookmarked = () =>
    dataState?.bookmarks?.filter((postId) => postId === _id)?.length !== 0;

  const bookmarkClickHandler = () => {
    if (isBookmarked()) {
      removeFromBookmarkPostHandler(authState?.token, _id, dataDispatch);
      toast.success("Removed from Bookmarks");
    } else {
      addToBookmarkPostHandler(authState?.token, _id, dataDispatch);
      toast.success("Added to Bookmarks");
    }
  };

  const copyLinkHandler = () => {
    navigator.clipboard.writeText(`https://tech-social.vercel.app/post/${_id}`);
    toast.success("Link Copied. Start sharing!");
  };

  return (
    <div key={_id} className="postcard-main">
      <div className="postcard-header">
        <div
          className="postcard-header-left"
          onClick={() => navigate(`/profile/${username}`)}
        >
          <img src={userDetails?.profileAvatar} alt="avatar" />
          <div>
            <h4>{`${userDetails?.firstName} ${userDetails?.lastName}`}</h4>
            <small>
              @{username}
              {" - "}
              <span>{` ${new Date(createdAt)
                .toDateString()
                .split(" ")
                .slice(1, 4)
                .join(" ")}`}</span>
            </small>
          </div>
        </div>
        {username === authState?.user?.username && (
          <div className="edit-delete-icon">
            <i
              class="fa-solid fa-ellipsis"
              onClick={() => setShowOptions(!showOptions)}
            ></i>
            {showOptions && (
              <div className="edit-delete-post-modal">
                <div onClick={editClickHandler}>Edit</div>
                <hr />
                <div onClick={deleteClickHandler}>Delete</div>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className="postcard-content-main"
        onClick={() => {
          navigate(`/post/${_id}`);
        }}
      >
        <p className="content">{content}</p>
        {contentLink && (
          <a href={`${contentLink}`} target="_blank" rel="noopener noreferrer">
            {contentLink}
          </a>
        )}
        {mediaURL && mediaURL.split("/")[4] === "image" ? (
          <img
            src={mediaURL}
            alt="post-pic"
            style={{ width: "100%", height: "300px", objectFit: "cover" }}
          />
        ) : (
          mediaURL && (
            <video
              controls
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            >
              <source src={mediaURL} />
            </video>
          )
        )}
      </div>
      <hr />
      <div className="postcard-buttons">
        <div>
          <i
            className={`${isliked() ? "fa-solid" : "fa-regular"} fa-heart`}
            onClick={() => {
              if (!authState?.token) {
                toast.error("Please login to proceed!");
              } else {
                isliked()
                  ? dislikePostHandler(authState?.token, _id, dataDispatch)
                  : likePostHandler(authState?.token, _id, dataDispatch);
              }
            }}
          ></i>{" "}
          <span>{likes?.likeCount}</span>
        </div>
        <div>
          <i
            className="fa-regular fa-comment"
            onClick={() => setShowCommentSection(!showCommentSection)}
          ></i>{" "}
          <span>{comments?.length}</span>
        </div>
        <div>
          <i
            className={`${
              isBookmarked() ? "fa-solid" : "fa-regular"
            } fa-bookmark`}
            onClick={() => {
              if (!authState?.token) {
                toast.error("Please login to proceed!");
              } else {
                bookmarkClickHandler();
              }
            }}
          ></i>
        </div>
        <div>
          <i
            class="fa-regular fa-share-from-square"
            onClick={copyLinkHandler}
          ></i>
        </div>
      </div>
      {showCommentSection && <Comment post={post} />}
    </div>
  );
};

export default PostCard;

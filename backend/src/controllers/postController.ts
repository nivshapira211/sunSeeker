import { Request, Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { detectSunriseSunset } from '../services/aiService';

interface AuthRequest extends Request {
  user?: any;
}

export const getPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Post.countDocuments();
    const posts = await Post.find({})
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      totalCount,
      hasMore: skip + posts.length < totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const searchPosts = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  if (!query) {
    res.status(400).json({ message: 'Search query is required' });
    return;
  }

  try {
    const totalCount = await Post.countDocuments({ $text: { $search: query } });
    const posts = await Post.find({ $text: { $search: query } })
      .populate('user', 'username avatar')
      .skip(skip)
      .limit(pageSize);

    res.json({
      posts,
      totalCount,
      hasMore: skip + posts.length < totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching posts' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  const { caption, location, time, date, type, coordinates, exif } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const imagePathForAi = req.file ? req.file.path : undefined;

  try {
    let detectedType = type;
    if (!detectedType && imagePathForAi) {
      const aiResult = await detectSunriseSunset(imagePathForAi);
      detectedType = aiResult.type === 'unknown' ? 'sunrise' : aiResult.type;
    }

    const post = await Post.create({
      imageUrl,
      caption,
      location,
      time,
      date,
      type: detectedType || 'sunrise', // Default to sunrise if not provided and no image
      coordinates: coordinates ? JSON.parse(coordinates) : { lat: 0, lng: 0 },
      exif: exif ? JSON.parse(exif) : { camera: 'Unknown', lens: '', aperture: '', iso: '', shutter: '' },
      user: req.user._id,
    });

    const populatedPost = await post.populate('user', 'username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: 'Error creating post' });
  }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    const totalCount = await Post.countDocuments({ user: userId });
    const posts = await Post.find({ user: userId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      posts,
      totalCount,
      hasMore: skip + posts.length < totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username avatar');
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      post.caption = req.body.caption || post.caption;
      post.location = req.body.location || post.location;
      post.time = req.body.time || post.time;
      post.date = req.body.date || post.date;
      post.type = req.body.type || post.type;
      
      if (req.file) {
        post.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      await post.deleteOne();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      const alreadyLiked = post.likes.some((id) => id.toString() === req.user._id.toString());

      if (alreadyLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }

      await post.save();
      res.json({ likes: post.likes.length, liked: !alreadyLiked });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).populate('userId', 'username avatar');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.create({
      postId: req.params.id,
      userId: req.user._id,
      text: req.body.text,
    });

    const post = await Post.findById(req.params.id);
    if (post) {
      post.commentCount = (post.commentCount ?? 0) + 1;
      await post.save();
    }

    const populatedComment = await comment.populate('userId', 'username avatar');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id: postId, commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    if (comment.postId.toString() !== postId) {
      res.status(400).json({ message: 'Comment does not belong to this post' });
      return;
    }
    if (comment.userId.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized to delete this comment' });
      return;
    }

    await comment.deleteOne();
    const post = await Post.findById(postId);
    if (post) {
      post.commentCount = Math.max(0, (post.commentCount ?? 0) - 1);
      await post.save();
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

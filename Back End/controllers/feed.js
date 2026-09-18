exports.getFeed = (req, res, next) => {
  const userId = req.userId;
  res.status(200).json({ 
    message: 'Feed fetched successfully.',
    userId: userId
  });
}

exports.postFeed = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  res.status(201).json({ message: 'Feed created successfully.',
    feed: { id: new Date().toISOString(), title: title, content: content }
  });
}
var mysql = require('mysql');
var dbConfig = {
    host: '127.0.0.1',
    user: 'test', // mysql的账号
    password: '123456', // mysql 的密码
    database: 'mybookmarks',
    multipleStatements: true,
    port: 3306
};
var client = {}

function handleDisconnect() {
    client = mysql.createConnection(dbConfig);

    client.connect(function(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    client.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

Date.prototype.format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// select 最多返回一行的话，返回对象，否则返回数组
// insert 返回关键字
// update delete 返回影响的行数
var db = {

}
// var sql = "SELECT * FROM `users` WHERE `username` = 'luchenqun1'";
// client.query(sql, (err, result) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(result);
//     }
// });

db.addBookmark = function(user_id, bookmark) {
    var insertSql = "INSERT INTO `bookmarks` (`user_id`, `title`, `description`, `url`, `public`, `click_count`) VALUES ('" + user_id + "', '" + bookmark.title + "', " + client.escape(bookmark.description) + ", '" + bookmark.url + "', '" + bookmark.public + "', '1')";
    var selectSql = "SELECT * FROM `bookmarks` WHERE `user_id` = '" + user_id + "' AND `url` = '" + bookmark.url + "'"
    return new Promise(function(resolve, reject) {
        client.query(selectSql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length >= 1) {
                    resolve(result[0].id);
                } else {
                    client.query(insertSql, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.insertId);
                        }
                    });
                }
            }
        });
    });
};

db.delBookmark = function(id) {
    var sql = "DELETE FROM `bookmarks` WHERE (`id`='" + id + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.updateBookmark = function(bookmark) {
    var sql = "UPDATE `bookmarks` SET `title`='" + bookmark.title + "', `description`=" + client.escape(bookmark.description) + ", `url`='" + bookmark.url + "', `public`='" + bookmark.public + "' WHERE (`id`='" + bookmark.id + "')";
    console.log("sql updateBookmark = " + sql);
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.getBookmark = function(id) {
    var sql = "SELECT * FROM `bookmarks` WHERE `id` = '" + id + "'";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

db.getBookmarkTags = function(bookmard_id) {
    var sql = "SELECT tag_id FROM `tags_bookmarks` WHERE `bookmark_id` = '" + bookmard_id + "'";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                var tags = result.map((item) => item.tag_id);
                resolve(tags);
            }
        });
    });
}

db.delBookmarkTags = function(bookmard_id) {
    var sql = "DELETE FROM `tags_bookmarks` WHERE (`bookmark_id`='" + bookmard_id + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.getBookmarkIdsByTagId = function(tagId) {
    var sql = "SELECT bookmark_id FROM `tags_bookmarks` WHERE `tag_id` = '" + tagId + "'";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

db.delTag = function(tagId) {
    var sql = "DELETE FROM `tags` WHERE (`id`='" + tagId + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.delTagBookmarks = function(tagId) {
    var sql = "DELETE FROM `tags_bookmarks` WHERE (`tag_id`='" + tagId + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.delBookmarks = function(bookmarkIds) {
    var sql = "DELETE FROM `bookmarks` WHERE id IN (" + (bookmarkIds.toString() || ("-1")) + ")";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.delTagsBookmarks = function(bookmarkIds) {
    var sql = "DELETE FROM `tags_bookmarks` WHERE bookmark_id IN (" + (bookmarkIds.toString() || ("-1")) + ")";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.addTagsBookmarks = function(tags, bookmard_id) {
    sql = "INSERT INTO `tags_bookmarks` (`tag_id`, `bookmark_id`) VALUES";
    for (var i = 0; i < tags.length; i++) {
        if (i >= 1) {
            sql += ','
        }
        sql += "('" + tags[i] + "', '" + bookmard_id + "')";
    }
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.updateLastUseTags = function(user_id, tags) {
    sql = "UPDATE tags SET last_use = NOW() WHERE user_id = '" + user_id + "' AND id in (" + tags.toString() + ")";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.clickBookmark = function(id, user_id) {
    var sql = "UPDATE `bookmarks` SET `click_count`=`click_count`+1, `last_click`=now() WHERE (`id`='" + id + "') AND (`user_id`='" + user_id + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
};

db.updateUserLastLogin = function(id) {
    console.log('updateUserLastLogin');
    var sql = "UPDATE `users` SET `last_login`=now() WHERE (`id`='" + id + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
};

db.resetPassword = function(userId, password) {
    console.log('updateUserLastLogin');
    var sql = "UPDATE `users` SET `password` = '" + password + "' WHERE(`id` = '" + userId + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.updateShowStyle = function(userId, show_style) {
    console.log('updateUserLastLogin');
    var sql = "UPDATE `users` SET `show_style` = '" + show_style + "' WHERE(`id` = '" + userId + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.register = function(user) {
    console.log('register');
    var sql = "INSERT INTO `users` (`username`, `password`, `email`) VALUES ('" + user.username + "', '" + user.password + "', '" + user.email + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
                db.insertDefaultBookmarks(result.insertId);
            }
        });
    });
};

db.insertDefaultBookmarks = function(userId) {
    var tags_name = ["常用", "未分类", "收藏"];

    db.addTags(userId, tags_name)
        .then((insertId) => {
            var bookmarks = [{
                title: "谷歌",
                description: "要翻墙的搜索网站",
                url: "https://www.google.com.hk/",
                public: "0"
            }, {
                title: "百度",
                description: "A:百度一下你会死啊？B:会！",
                url: "https://www.baidu.com/",
                public: "0"
            }, {
                title: "微博",
                description: "随时随地发现新鲜事",
                url: "http://weibo.com/",
                public: "0"
            }, {
                title: "天猫",
                description: "上天猫，就够了！",
                url: "https://www.tmall.com/",
                public: "0"
            }, {
                title: "优酷",
                description: "视频网站",
                url: "http://www.youku.com/",
                public: "0"
            }];

            var tags = [insertId];
            bookmarks.forEach((bookmark) => {
                db.addBookmark(userId, bookmark)
                    .then((insertId) => db.addTagsBookmarks(tags, insertId))
                    .catch((err) => console.log('insertDefaultBookmarks err2', err)); // oops!
            })
        })
        .catch((err) => console.log('insertDefaultBookmarks err1', err)); // oops!
}

db.getUser = function(username) {
    console.log('getUser');
    var sql = "SELECT * FROM `users` WHERE `username` = '" + username + "'";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
};

db.getTags = function(user_id) {
    console.log('getTags');
    var sql = "SELECT t.id, t.user_id, t.name, DATE_FORMAT(t.last_use, '%Y-%m-%d %H:%i:%s') as last_use, t.sort, tb.cnt FROM `tags` as t LEFT OUTER JOIN ( SELECT `tag_id`, COUNT(tag_id) as cnt FROM tags_bookmarks GROUP BY tag_id ) tb ON t.id = tb.tag_id WHERE t.user_id = '" + user_id + "' ORDER BY t.sort, t.last_use DESC";

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

db.updateTagName = function(tag) {
    console.log('updateTagName');
    var sql = "UPDATE `tags` SET `name`='" + tag.name + "' WHERE (`id`='" + tag.id + "')";
    console.log(sql);
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
};

db.updateTagsIndex = function(tagsIndex) {
    console.log('updateTagsIndex');
    var sql = "UPDATE tags SET sort =  CASE id ";
    tagsIndex.forEach((tagIndex) => {
        sql += "WHEN " + tagIndex.id + " THEN " + tagIndex.index + " ";
    })
    var tagsId = tagsIndex.map((item) => item.id);
    sql += "END WHERE id IN (" + tagsId.toString() + ")";

    console.log(sql);
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
};

db.getTagsByIds = function(tagIds) {
    var sql = "SELECT * FROM `tags` WHERE id in(" + (tagIds.toString() || ("-1")) + ") GROUP BY id"; // 如果是空的，那查一个不存在的就行了。
    console.log('db getTagsByIds = ', sql);

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

db.getAdvices = function(params) {
    console.log('getAdvices');
    var sql = "SELECT mod(CEIL(RAND()*100), 5) as head_id, a.id, a.user_id, u.username, a.comment, a.category, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as created_at, a.state  FROM `advices` as a LEFT OUTER JOIN users as u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 0, 100";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

db.addAdvice = function(params) {
    console.log('addAdvice');
    var sql = "INSERT INTO `advices` (`user_id`, `comment`, `category`) VALUES ('" + params.user_id + "', '" + params.comment + "', '" + params.category + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
};

db.getTagsByNames = function(user_id, tags_name) {
    console.log('getTagsByNames');
    var sql = "SELECT * FROM `tags` WHERE `user_id` = '" + user_id + "' AND `name` in (" + tags_name.toString() + ")";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

db.addTags = function(user_id, tags_name) {
    console.log('addTags', tags_name);
    var sql = "INSERT INTO `tags` (`user_id`, `name`, `sort`) VALUES";
    tags_name.forEach((name, i) => {
        if (i >= 1) {
            sql += ','
        }
        sql += "('" + user_id + "', '" + name + "', '88')"; // sort默认一个比较大的值，默认在后面
    });
    return new Promise(function(resolve, reject) {
        if (tags_name.length == 0) {
            reject("tags_name is empty");
        } else {
            client.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.insertId);
                }
            });
        }
    });
};

db.getBookmarksNavigate = function(tags) {
    // console.log('getBookmarksNavigate');
    // var sql = "SELECT t.id as tag_id, t.name as tag_name, b.* FROM `tags` as t LEFT OUTER JOIN tags_bookmarks as tb ON t.id = tb.tag_id LEFT OUTER JOIN bookmarks as b ON tb.bookmark_id = b.id WHERE t.user_id='" + user_id + "' ORDER BY t.id ASC, b.click_count DESC";
    var sql = "";
    tags.forEach((tag, index) => {
        var t = 't' + tag.id;
        if (index >= 1) {
            sql += " UNION "
        }
        sql += "(SELECT * FROM ((SELECT t.id AS tag_id, t.`name` as tag_name, t.sort, b.* FROM `tags` as t, `bookmarks`as b, `tags_bookmarks` as tb WHERE t.id = tb.tag_id AND b.id = tb.bookmark_id AND t.id = " + tag.id + " ORDER BY b.click_count DESC LIMIT 0, 16) UNION (SELECT t.id AS tag_id, t.`name` as tag_name, t.sort, b.* FROM `tags` as t, `bookmarks`as b, `tags_bookmarks` as tb WHERE t.id = tb.tag_id AND b.id = tb.bookmark_id AND t.id = " + tag.id + " ORDER BY b.created_at DESC LIMIT 0, 16)) as " + t + " ORDER BY " + t + ".click_count DESC, " + t + ".created_at DESC)";
    })
    // console.log('getBookmarksNavigate ', sql);

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

db.getBookmarksCostomTag = function(user_id) {
    console.log('getBookmarksCostomTag');
    var sql1 = "(SELECT id, user_id, title, description, url, public, click_count, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,  DATE_FORMAT(last_click, '%Y-%m-%d %H:%i:%s') as last_click FROM `bookmarks` WHERE `user_id` = '" + user_id + "' ORDER BY `click_count` DESC LIMIT 0, 68)";
    var sql2 = "(SELECT id, user_id, title, description, url, public, click_count, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,  DATE_FORMAT(last_click, '%Y-%m-%d %H:%i:%s') as last_click FROM `bookmarks` WHERE `user_id` = '" + user_id + "' ORDER BY `created_at` DESC LIMIT 0, 68)";
    var sql3 = "(SELECT id, user_id, title, description, url, public, click_count, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,  DATE_FORMAT(last_click, '%Y-%m-%d %H:%i:%s') as last_click FROM `bookmarks` WHERE `user_id` = '" + user_id + "' ORDER BY `last_click` DESC LIMIT 0, 68)";

    var sql = sql1 + " UNION " + sql2 + " UNION " + sql3;
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

db.getBookmarksTable = function(params) {
    var user_id = params.userId;
    params.currentPage = params.currentPage || 1;
    params.perPageItems = params.perPageItems || 20;

    var sql = "SELECT id, user_id, title, description, url, public, click_count, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,  DATE_FORMAT(last_click, '%Y-%m-%d %H:%i:%s') as last_click FROM `bookmarks` WHERE 1=1";
    if (user_id) {
        sql += " AND `user_id` = '" + user_id + "'";
    }
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                var bookmarksClickCount, bookmarksCreatedAt, bookmarksLatestClick;
                result.sort((a, b) => {
                    var click1 = parseInt(a.click_count);
                    var click2 = parseInt(b.click_count);
                    if (click1 > click2) {
                        return -1;
                    } else if (click1 == click2) {
                        return a.created_at >= b.created_at ? -1 : 1;
                    } else {
                        return 1;
                    }
                })
                bookmarksClickCount = result.slice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems);

                result.sort((a, b) => a.created_at >= b.created_at ? -1 : 1);
                bookmarksCreatedAt = result.slice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems);

                result.sort((a, b) => a.last_click >= b.last_click ? -1 : 1);
                bookmarksLatestClick = result.slice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems);

                var bookmarksData = {
                    totalItems: result.length,
                    bookmarksClickCount: bookmarksClickCount,
                    bookmarksCreatedAt: bookmarksCreatedAt,
                    bookmarksLatestClick: bookmarksLatestClick,
                }
                resolve(bookmarksData);
            }
        });
    })
}

db.getBookmarksByTag = function(params) {
    var tag_id = params.tagId;
    params.currentPage = params.currentPage || 1;
    params.perPageItems = params.perPageItems || 20;

    var sql = "SELECT bookmarks.id, bookmarks.user_id, bookmarks.title, bookmarks.description, bookmarks.url, bookmarks.public, bookmarks.click_count, DATE_FORMAT(bookmarks.created_at, '%Y-%m-%d %H:%i:%s') as created_at,  DATE_FORMAT(bookmarks.last_click, '%Y-%m-%d %H:%i:%s') as last_click FROM `tags_bookmarks`, `bookmarks` WHERE tags_bookmarks.tag_id = '" + tag_id + "' AND tags_bookmarks.bookmark_id = bookmarks.id";

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                var bookmarksClickCount, bookmarksCreatedAt, bookmarksLatestClick;
                result.sort((a, b) => {
                    var click1 = parseInt(a.click_count);
                    var click2 = parseInt(b.click_count);
                    if (click1 > click2) {
                        return -1;
                    } else if (click1 == click2) {
                        return a.created_at >= b.created_at ? -1 : 1;
                    } else {
                        return 1;
                    }
                })
                bookmarksClickCount = result.slice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems);

                result.sort((a, b) => a.created_at >= b.created_at ? -1 : 1);
                bookmarksCreatedAt = result.slice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems);

                result.sort((a, b) => a.last_click >= b.last_click ? -1 : 1);
                bookmarksLatestClick = result.slice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems);

                var bookmarksData = {
                    totalItems: result.length,
                    bookmarksClickCount: bookmarksClickCount,
                    bookmarksCreatedAt: bookmarksCreatedAt,
                    bookmarksLatestClick: bookmarksLatestClick,
                }
                resolve(bookmarksData);
            }
        });
    })
}

db.getBookmarksSearch = function(params) {
    var sql = "SELECT id, user_id, title, description, url, public, click_count, DATE_FORMAT(created_at, '%Y-%m-%d') as created_at,  DATE_FORMAT(last_click, '%Y-%m-%d') as last_click FROM `bookmarks` WHERE 1=1";

    if (params.dateCreate) {
        var d = new Date();
        d.setDate(d.getDate() - parseInt(params.dateCreate));
        sql += " AND `created_at` >= '" + d.format('yyyy-MM-dd') + "'"
    } else if (params.dateCreateBegin && params.dateCreateEnd) {
        sql += " AND `created_at` >= '" + params.dateCreateBegin + " 00:00:00" + "' AND `created_at` <= '" + params.dateCreateEnd + " 23:59:59" + "' "
    }
    if (params.dateClick) {
        var d = new Date();
        d.setDate(d.getDate() - parseInt(params.dateClick));
        sql += " AND `last_click` >= '" + d.format('yyyy-MM-dd') + "'"
    } else if (params.dateClickBegin && params.dateClickEnd) {
        sql += " AND `last_click` >= '" + params.dateClickBegin + " 00:00:00" + "' AND `last_click` <= '" + params.dateClickEnd + " 23:59:59" + "' "
    }

    if (params.searchWord) {
        sql += " AND (`title` LIKE '%" + params.searchWord + "%' OR `url` LIKE '%" + params.searchWord + "%')"
    }

    if (params.userRange == '1') {
        if (params.userId) {
            sql += " AND `user_id` = '" + params.userId + "'"
        }

        if (params.tags) {
            sql += " AND `id` IN (SELECT `bookmark_id` FROM `tags_bookmarks` WHERE tag_id IN (" + params.tags + "))"
        }
    } else {
        if (params.username) {
            sql += " AND `user_id` IN (SELECT `id` FROM `users` WHERE `username` LIKE '%" + params.username + "%' )"
        }
    }

    params.currentPage = params.currentPage || 1;
    params.perPageItems = params.perPageItems || 20;
    sql += " GROUP BY url ORDER BY click_count DESC, created_at DESC";
    console.log(sql);
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                // 如果是全站搜索，默认有限显示其他用户的
                if (params.userRange == '2') {
                    result.sort((a, b) => {
                        return params.userId == a.user_id ? 1 : -1;
                    })
                }
                var searchData = {
                    totalItems: result.length,
                    bookmarks: result.splice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems),
                }
                resolve(searchData);
            }
        });
    })
}

// CREATE TABLE `hot_bookmarks` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,     -- id(articleId)
//   `date` int(11) NOT NULL DEFAULT 0,        -- 日期(自己添加)
//   `title` varchar(255) DEFAULT NULL,        -- 标题(title)
//   `description` varchar(4096) DEFAULT NULL, -- 描述(自己添加)
//   `url` varchar(1024) DEFAULT NULL,         -- 链接(url)
//   `fav_count` smallint DEFAULT 1,           -- 总共收藏人数(favCount)
//   `created_by` varchar(64) DEFAULT NULL,    -- 创建者(sourceName)
//   `created_at` bigint DEFAULT 0,            -- 创建时间(updatetime)
//   `last_click` bigint DEFAULT 0,            -- 最后一次点击时间(createtime)
//   `snap_url` varchar(1024) DEFAULT NULL,    -- 截图链接(imageList[0])
//   `favicon_url` varchar(1024) DEFAULT NULL, -- icon链接(sourceLogo)
//   `status` tinyint(4) DEFAULT '0',          -- 状态
//   PRIMARY KEY (`id`)
// );

db.getHotBookmarksSearch = function(params) {
    var sql = "SELECT id, title, description, url, fav_count, created_by, created_at, last_click, snap_url, favicon_url FROM `hot_bookmarks` WHERE status=0";

    if (params.dateCreate) {
        var d = new Date();
        d.setDate(d.getDate() - parseInt(params.dateCreate));
        sql += " AND `created_at` >= '" + d.getTime() + "'"
    } else if (params.dateCreateBegin && params.dateCreateEnd) {
        var dateCreateBegin = new Date(params.dateCreateBegin + "T00:00:00");
        var dateCreateEnd = new Date(params.dateCreateEnd + "T23:59:59");
        sql += " AND `created_at` >= '" + dateCreateBegin.getTime() + "' AND `created_at` <= '" + dateCreateEnd.getTime() + "' "
    }
    if (params.dateClick) {
        var d = new Date();
        d.setDate(d.getDate() - parseInt(params.dateClick));
        sql += " AND `last_click` >= '" + d.getTime() + "'"
    } else if (params.dateClickBegin && params.dateClickEnd) {
        var dateClickBegin = new Date(params.dateClickBegin + "T00:00:00");
        var dateClickEnd = new Date(params.dateClickEnd + "T23:59:59");
        sql += " AND `last_click` >= '" + dateClickBegin.getTime() + "' AND `last_click` <= '" + dateClickEnd.getTime() + "' "
    }

    if (params.searchWord) {
        sql += " AND (`title` LIKE '%" + params.searchWord + "%')"
    }
    sql += " ORDER BY fav_count DESC";
    console.log(sql);
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                params.currentPage = params.currentPage || 1;
                params.perPageItems = params.perPageItems || 20;
                var searchData = {
                    totalItems: result.length,
                    bookmarks: result.splice((params.currentPage - 1) * params.perPageItems, params.currentPage * params.perPageItems),
                }
                resolve(searchData);
            }
        });
    })
}

db.getBookmarksCard = function(user_id) {
    return db.getBookmarksTable(user_id);
}

db.getTagsBookmarks = function(bookmark_ids) {
    var sql = "SELECT * FROM `tags_bookmarks` WHERE bookmark_id in(" + (bookmark_ids.toString() || ("-1")) + ")"; // 如果是空的，那查一个不存在的就行了。
    console.log('getTagsBookmarks', sql);

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

db.getActiveUsers = function() {
    var sql = " (SELECT username, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') as last_login, email FROM users ORDER BY last_login DESC LIMIT 0, 5) UNION (SELECT username, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') as last_login, email FROM users ORDER BY created_at DESC LIMIT 0, 5)";
    console.log('getActiveUsers', sql);

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
db.getBookmarks = function() {
    var sql = "SELECT id, snap_state FROM `bookmarks`"; // 如果是空的，那查一个不存在的就行了。
    console.log('getBookmarks', sql);

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

db.getBookmarkWaitSnap = function(today) {
    var todayNotSnap = today + 31;
    var sql = "SELECT id, url, snap_state FROM `bookmarks` WHERE `snap_state`>=0 AND `snap_state` <= 64 AND snap_state != " + todayNotSnap + " ORDER BY created_at DESC LIMIT 0, 1";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

db.getBookmarkWaitFavicon = function(today) {
    var todayNotSnap = today + 31;
    var sql = "SELECT id, url, favicon_state FROM `bookmarks` WHERE `favicon_state`>=0 AND `favicon_state` <= 64 AND favicon_state != " + todayNotSnap + " ORDER BY created_at DESC LIMIT 0, 1";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

db.updateBookmarkSnapState = function(id, snapState) {
    console.log("updateBookmarkSnapState id = " + id + ", snapState = " + snapState);
    var sql = "UPDATE `bookmarks` SET `snap_state`='" + snapState + "' WHERE (`id`='" + id + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.updateBookmarkFaviconState = function(id, faviconState) {
    console.log("updateBookmarkFaviconState id = " + id + ", faviconState = " + faviconState);
    var sql = "UPDATE `bookmarks` SET `favicon_state`='" + faviconState + "' WHERE (`id`='" + id + "')";
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

db.addHotBookmark = function(bookmark) {
    var sql = "REPLACE INTO `hot_bookmarks` (`id`, `date`, `title`, `url`, `fav_count`, `created_by`, `created_at`, `last_click`, `snap_url`, `favicon_url`) VALUES ('" + bookmark.id + "', '" + bookmark.date + "', " + client.escape(bookmark.title) + ", " + client.escape(bookmark.url) + ", '" + bookmark.fav_count + "', " + client.escape(bookmark.created_by) + ", '" + bookmark.created_at + "', '" + bookmark.last_click + "', " + client.escape(bookmark.snap_url) + ", " + client.escape(bookmark.favicon_url) + ")";

    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

db.hotBookmarks = function(date) {
    var sql = "SELECT * FROM `hot_bookmarks` WHERE `date` = " + date + " AND `status` = 0"
    return new Promise(function(resolve, reject) {
        client.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = db;

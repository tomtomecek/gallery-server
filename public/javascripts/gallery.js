$(function() {
  var templates = {};
  $("script[type='text/x-handlebars']").each(function() {
    var $template = $(this);
    templates[$template.attr("id")] = Handlebars.compile($template.html());
  });

  $("[data-type=partial]").each(function() {
    var $partial = $(this);
    Handlebars.registerPartial($partial.attr("id"), $partial.html());
  });

  var slideshow = {
    $el: $("#slideshow"),
    duration: 500,
    prevSlide: function(e) {
      e.preventDefault();
      var $current = this.$el.find("figure:visible"),
          $prev = $current.prev("figure");

      if (!$prev.length) {
        $prev = this.$el.find("figure").last();
      }
      $current.fadeOut(this.duration, function() {
        $prev.fadeIn(this.duration);
      });
      this.renderPhotoContent($prev.attr("data-id"));
    },
    nextSlide: function(e) {
      e.preventDefault();
      var $current = this.$el.find("figure:visible"),
          $next = $current.next("figure");

      if (!$next.length) {
        $next = this.$el.find("figure").first();
      }
      $current.fadeOut(this.duration, function() {
        $next.fadeIn(this.duration);
      });
      this.renderPhotoContent($next.attr("data-id"));
    },
    renderPhotoContent: function(idx) {
      renderPhotoInformation(+idx);
      $("[name=photo_id]").val(idx);
      getCommentsFor(idx);
    },
    bind: function() {
      this.$el.find("a.prev").on("click", $.proxy(this.prevSlide, this));
      this.$el.find("a.next").on("click", $.proxy(this.nextSlide, this));
    },
    init: function() {
      this.bind();
    }
  }

  function renderPhotos() {
    $("#slides").html(templates.photos({ photos: photos }));
  }

  function renderPhotoInformation(idx) {
    var photo = photos.filter(function(item) {
      return item.id === idx;
    })[0];
    $("section > header").html(templates.photo_information(photo));
  }

  function getCommentsFor(idx) {
    $.ajax({
      url: "/comments",
      data: "photo_id=" + idx,
      success: function(comment_json) {
        $("#comment-area").html(templates.comments({ comments: comment_json }));
      }
    });
  }

  $.ajax({
    url: "/photos",
    success: function(json) {
      photos = json;
      renderPhotos();
      renderPhotoInformation(photos[0].id);
      slideshow.init();
      getCommentsFor(photos[0].id);
    }
  });

  $("section > header").on("click", ".social-buttons button", function(e) {
    e.preventDefault();
    var $element = $(e.target);

    $.ajax({
      url: $element.attr("href"),
      data: "photo_id=" + $element.attr("data-id"),
      type: "post",
      dataType: "JSON",
      success: function(response_json) {
        $element.text(function(i, txt) {
          return txt.replace(/\d+/, response_json.total);
        });
      }
    });
  });

  $("form").on("submit", function(e) {
    e.preventDefault();
    var $form = $(e.target);

    $.ajax({
      url: $form.attr("action"),
      type: $form.attr("method"),
      data: $form.serialize(),
      success: function(json) {
        $("#comment-area").append(templates.comment(json));
        $form.get(0).reset();
      }
    });
  });
});

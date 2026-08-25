(function () {
  "use strict";

  var currentScript = document.currentScript;
  var serviceOrigin = currentScript && currentScript.src ? new URL(currentScript.src, document.baseURI).origin : "";

  function resolveTarget(target) {
    if (target && typeof target === "object" && target.nodeType === 1) return target;
    if (typeof target !== "string") return null;
    try {
      return document.querySelector(target);
    } catch {
      return null;
    }
  }

  function showError(target, message) {
    var element = resolveTarget(target);
    var error = document.createElement("div");
    error.className = "momo-card-error";
    error.setAttribute("role", "alert");
    error.textContent = message;
    if (!element) {
      document.body.appendChild(error);
      return { destroy: function () { if (error.parentNode === document.body) document.body.removeChild(error); } };
    }
    element.replaceChildren(error);
    return { destroy: function () { if (error.parentNode === element) element.removeChild(error); } };
  }

  function mount(target, options) {
    var settings = options || {};
    if (!settings.cardId) return showError(target, "請提供商品 ID");
    if (!serviceOrigin) return showError(target, "找不到商品服務來源");
    var element = resolveTarget(target);
    if (!element) return showError(target, "找不到嵌入目標");

    var iframe = document.createElement("iframe");
    iframe.src = serviceOrigin + "/embed/" + encodeURIComponent(settings.cardId);
    iframe.title = "Momo 商品卡：" + settings.cardId;
    iframe.loading = "lazy";
    iframe.style.width = "100%";
    iframe.style.minHeight = "640px";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.setAttribute("data-momo-card", settings.cardId);
    element.replaceChildren(iframe);

    return {
      destroy: function () {
        if (iframe.parentNode === element) element.removeChild(iframe);
      },
    };
  }

  window.MomoCard = { mount: mount };
}());

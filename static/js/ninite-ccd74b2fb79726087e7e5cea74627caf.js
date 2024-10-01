// avoid arrow functions, backtick templates, and for of loops for IE11

// homepage
(function () {
  function checkApps() {
    const appCount = $(".js-homepage-app-checkbox:checked").length;
    $(".js-homepage-no-apps").toggleClass("hidden", appCount > 0);
    $(".js-homepage-get-installer").prop("disabled", appCount === 0);
  }
  $(".js-homepage-app-checkbox").change(checkApps);
  $(checkApps);

  function selectApps(e, checked) {
    e.preventDefault();
    $(e.target)
      .parents(".js-select-container")
      .find(".js-homepage-app-checkbox")
      .prop("checked", checked);
    checkApps();
  }
  $(".js-select-all").click(function (e) {
    selectApps(e, true);
  });
  $(".js-select-clear").click(function (e) {
    selectApps(e, false);
  });

  $(".js-homepage-suggest-app-show").click(function (e) {
    e.preventDefault();
    $(e.target).addClass("hidden");
    $(".js-homepage-suggest-app").removeClass("hidden");
  });

  $(".js-homepage-suggest-app").submit(function (e) {
    e.preventDefault();
    const $form = $(e.target);
    const $thanks = $(".js-homepage-suggest-app-thanks");
    if ($.trim($form[0].name.value) !== "") {
      $.post($form.attr("action"), $(e.target).serialize(), function () {
        $form[0].name.value = "";
        $thanks.removeClass("hidden");
        setTimeout(function () {
          $thanks.addClass("hidden");
        }, 2000);
      });
    }
  });

  $(".js-homepage-old-os").toggleClass(
    "hidden",
    !/Windows XP|Windows NT 5\.1|Windows NT 5\.2|Windows NT 6\.0/.test(
      navigator.userAgent
    )
  );
})();

// address
(function () {
  function checkCountry() {
    const isUS = $(".js-address-country select").val() === "US";
    $(".js-address-state").toggleClass("hidden", isUS);
    $(".js-address-us-state").toggleClass("hidden", !isUS);
  }
  $(".js-address-country select").change(checkCountry);
  $(checkCountry);
})();

// pricing
(function () {
  function price_cents3(machines) {
    if (isNaN(machines) || machines < 1 || machines > 1000000) return 0;
    let n = machines;
    const rates = [
      { count: 20, cents: 100 },
      { count: 400, cents: 50 },
      { count: 1000000, cents: 25 },
    ];
    let cents = 0;
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      if (n > 0) {
        cents += Math.min(n, rate.count) * rate.cents;
        n -= rate.count;
      }
    }
    return cents;
  }

  function price_cents(machines, version) {
    if (machines === 0 || version === 0) return 2000; // legacy plans
    if (version === 1) {
      const rates = [
        // must be sorted descending by machines
        { machines: 5000, cents: 12 },
        { machines: 2000, cents: 15 },
        { machines: 250, cents: 18 },
        { machines: 0, cents: 20 },
      ];
      let n = Math.max(machines, 25);
      let cents = 0;
      rates.forEach(function (r) {
        if (n > r.machines) {
          cents += (n - r.machines) * r.cents;
          n = r.machines;
        }
      });
      return cents;
    }
    if (version === 2) return machines * 200;
    if (version === 3) return price_cents3(machines);
  }

  function cents_to_dollars(cents) {
    const s = String(cents);
    if (s.slice(-2) == "00") return s.slice(0, -2);
    return s.slice(0, -2) + "." + s.slice(-2);
  }

  function update_pricing() {
    let machines = $(
      "input.js-pricing-machines, .js-pricing-machines input"
    ).val();
    if (machines === "") return;
    machines = parseInt(machines);
    const pricing_version = parseInt(
      $("select.js-pricing-version, .js-pricing-version select").val() || "3"
    );
    const cents = price_cents(machines, pricing_version);
    $("input.js-pricing-rate-cents, .js-pricing-rate-cents input").val(cents);
    $("input.js-pricing-annual-price, .js-pricing-annual-price input").val(
      cents_to_dollars(cents * 12)
    );
    if (machines === 0) {
      $(
        "input.js-pricing-annual-description, .js-pricing-annual-description input"
      ).val("Ninite Pro 1 year");
    } else {
      $(
        "input.js-pricing-annual-description, .js-pricing-annual-description input"
      ).val(machines + " machines Ninite Pro 1 year");
    }
    checkRateCents();
  }

  $("input.js-pricing-machines, .js-pricing-machines input").on(
    "input",
    update_pricing
  );
  $("select.js-pricing-version, .js-pricing-version select").on(
    "change",
    update_pricing
  );

  const rateCents = document.querySelector(".js-pricing-rate-cents input");
  function checkRateCents() {
    const machines = document.querySelector(".js-pricing-machines input").value;
    if (machines === "") return;
    const pricing_version = parseInt(
      document.querySelector(".js-pricing-version select").value
    );
    const cents = price_cents(parseInt(machines), pricing_version);
    if (rateCents.value == cents) {
      document.querySelector(".js-pricing-warning").classList.add("hidden");
      document
        .querySelector(".js-pricing-rate-cents .form-group")
        .classList.remove("has-error");
    } else {
      document.querySelector(".js-pricing-warning").classList.remove("hidden");
      document
        .querySelector(".js-pricing-rate-cents .form-group")
        .classList.add("has-error");
    }
  }
  if (rateCents) {
    rateCents.addEventListener("input", checkRateCents);
    checkRateCents();
  }
})();

// pricing3
(function () {
  function price_cents(machines) {
    if (isNaN(machines) || machines < 1 || machines > 1000000) return 0;
    let n = machines;
    const rates = [
      { count: 20, cents: 100 },
      { count: 400, cents: 50 },
      { count: 1000000, cents: 25 },
    ];
    let cents = 0;
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      if (n > 0) {
        cents += Math.min(n, rate.count) * rate.cents;
        n -= rate.count;
      }
    }
    return cents;
  }

  function cents_to_dollars(cents) {
    if (cents == 0) return "";
    const s = String(cents);
    if (s.slice(-2) == "00") return s.slice(0, -2);
    return s.slice(0, -2) + "." + s.slice(-2);
  }

  function update_table_pricing(e) {
    const cents = price_cents(parseInt(e.target.value, 10));
    $(e.target)
      .closest("tr")
      .find(".js-pricing3-table-monthly")
      .text(cents_to_dollars(cents));
  }
  $(".js-pricing3-table-machines").on("input", update_table_pricing);

  function update_description(e) {
    const cents = price_cents(parseInt($(".js-pricing3-machines").val(), 10));
    let description = "$" + cents_to_dollars(cents) + "/month";
    if ($(".js-pricing3-account-type").filter(":checked").val() === "prepaid") {
      description = "$" + cents_to_dollars(12 * cents) + "/year";
    }
    $(".js-pricing3-description").text(description);
  }
  $(".js-pricing3-machines").on("input", update_description);
  $(".js-pricing3-account-type").on("change", update_description);
  if ($(".js-pricing3-description").length) {
    update_description();
  }
})();

// feedback
(function () {
  const $email = $(".js-feedback-email");
  const $button = $(".js-feedback-button");

  function updateButton() {
    if ($email.val() && $email.val().match(/@/) && $email.val().match(/\./)) {
      $button.text("Send and Get a Reply");
    } else {
      $button.text("Send Anonymously");
    }
  }

  $email.keyup(updateButton).change(updateButton);
  $(updateButton);
})();

// utility
(function () {
  $(".js-signout-link").click(function (e) {
    e.preventDefault();
    $(".js-signout-form").submit();
  });

  // https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
  $(".js-copy-click").click(function (e) {
    let target = document.querySelector(e.target.dataset.target);
    if (target.select) {
      // to select contents of an input or textarea element
      target.select();
      document.execCommand("copy");
    } else {
      let range = document.createRange();
      range.selectNode(target);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
    }
  });

  $(".js-fill-click").click(function (e) {
    let target = document.querySelector(e.target.dataset.target);
    $(target).val(e.target.dataset.fill);
  });
})();

// badclock
(function () {
  const $badclock = $(".js-badclock");
  if ($badclock.length) {
    const daysMs = 24 * 60 * 60 * 1000;
    const daysOff =
      Math.abs(Date.now() - Date.parse($badclock.data("date"))) / daysMs;
    if (daysOff > 3) {
      $badclock.removeClass("hidden");
    }
  }
})();

// admin
(function () {
  $(".js-confirm-click").click(function (e) {
    if (!confirm("really?")) {
      e.preventDefault();
    }
  });

  function update_diff() {
    let from = $(".js-app-config [name=diff_from]:checked").val();
    let to = $(".js-app-config [name=diff_to]:checked").val();
    if (from !== undefined && to !== undefined) {
      $.get(
        "/admin/configdiff?from=" + from + "&to=" + to,
        function (response) {
          $(".js-app-config-diff").html(response);
        }
      );
    }
  }

  if (
    $(".js-app-config [name=diff_from]").length >= 1 &&
    $(".js-app-config [name=diff_to]").length >= 2
  ) {
    $(".js-app-config [name=diff_from]")[0].checked = true;
    $(".js-app-config [name=diff_to]")[1].checked = true;
    update_diff();
  }

  function radio_listen(selector) {
    $(selector).click(function (e) {
      $(selector).prop("checked", false);
      e.target.checked = true;
      update_diff();
    });
  }

  radio_listen(".js-app-config [name=diff_from]");
  radio_listen(".js-app-config [name=diff_to]");

  $(".js-app-config-open").click(function (e) {
    e.preventDefault();
    let config_id = $(e.target).data("configId");
    $.getScript("/admin/trainer/" + config_id + "?script=1");
  });
})();

// a3 invoice
(function () {
  // remember most recent invoice date and type in sessionStorage for quick filling

  const TYPE_KEY = "lastInvoicePaymentType";
  const DATE_KEY = "lastInvoicePaymentDate";

  function lastPaymentSettings() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      type: sessionStorage.getItem(TYPE_KEY) || "check",
      date: sessionStorage.getItem(DATE_KEY) || today,
    };
  }

  $(".js-invoice-set-last-payment").click(function (e) {
    const last = lastPaymentSettings();
    $(".js-invoice-payment-type").val(last.type);
    $(".js-invoice-payment-date").val(last.date);
    $(".js-invoice-payment-date").focus();
    if ($(".js-invoice-payment-amount").val() === "") {
      $(".js-invoice-payment-amount").val($(".js-invoice-price").val());
    }
  });

  function updateButton() {
    const last = lastPaymentSettings();
    $(".js-invoice-set-last-payment").text(
      "paid by " + last.type + " on " + last.date
    );
  }

  $(".js-invoice-payment-type").on("input", function (e) {
    sessionStorage.setItem(TYPE_KEY, e.target.value);
    updateButton();
  });

  $(".js-invoice-payment-date").on("input", function (e) {
    sessionStorage.setItem(DATE_KEY, e.target.value);
    updateButton();
  });

  updateButton();
})();

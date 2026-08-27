(function(window) {
	"use strict";

	var META_EVENT_MAP = {
		view_item: "ViewContent",
		add_to_cart: "AddToCart",
		begin_checkout: "InitiateCheckout",
		add_payment_info: "AddPaymentInfo",
		purchase: "Purchase",
		lead: "Lead"
	};
	var META_USER_KEY_MAP = {
		sha256_email_address: "em",
		sha256_phone_number: "ph",
		sha256_first_name: "fn",
		sha256_last_name: "ln",
		sha256_city: "ct",
		sha256_state: "st",
		sha256_zip_code: "zp",
		sha256_country: "country",
		sha256_date_of_birth: "db",
		sha256_gender: "ge",
		fbp: "fbp",
		fbc: "fbc"
	};
	var advancedMatching = {};
	var externalId = null;
	var initialized = false;
	var pageViewTracked = false;

	function hasOwn(source, key) {
		return Object.prototype.hasOwnProperty.call(source, key);
	}

	function isArray(value) {
		return Object.prototype.toString.call(value) === "[object Array]";
	}

	function isObject(value) {
		return value != null && typeof value === "object" && isArray(value) === false;
	}

	function getPixelId() {
		if (window.tutorMetaPixelConfig == null || window.tutorMetaPixelConfig.pixelId == null) {
			return "";
		}
		return String(window.tutorMetaPixelConfig.pixelId);
	}

	function isBlank(value) {
		return value == null || value === "";
	}

	function copyObject(source) {
		var target = {};
		var key;
		for (key in source) {
			if (hasOwn(source, key)) {
				target[key] = source[key];
			}
		}
		return target;
	}

	function isEmptyObject(source) {
		var key;
		for (key in source) {
			if (hasOwn(source, key)) {
				return false;
			}
		}
		return true;
	}

	function normalizeNumber(value) {
		var parsed = parseFloat(value);
		return isNaN(parsed) ? null : parsed;
	}

	function sumQuantity(items) {
		var total = 0;
		var item;
		var quantity;
		var i;
		for (i = 0; i < items.length; i++) {
			item = items[i];
			quantity = normalizeNumber(item.quantity);
			total += quantity == null ? 1 : quantity;
		}
		return total;
	}

	function buildContents(items) {
		var contents = [];
		var contentIds = [];
		var item;
		var itemId;
		var price;
		var quantity;
		var i;

		for (i = 0; i < items.length; i++) {
			item = items[i];
			itemId = item.item_id || item.id;
			if (isBlank(itemId)) {
				continue;
			}

			price = normalizeNumber(item.price);
			quantity = normalizeNumber(item.quantity);
			contents.push({
				id: String(itemId),
				quantity: quantity == null ? 1 : quantity,
				item_price: price == null ? 0 : price
			});
			contentIds.push(String(itemId));
		}

		return {
			contents: contents,
			contentIds: contentIds
		};
	}

	function addIfPresent(target, key, value) {
		if (isBlank(value) === false && value != null) {
			target[key] = value;
		}
	}

	function mergeUserData(userData) {
		var changed = false;
		var sourceKey;
		var targetKey;

		if (isObject(userData) === false) {
			return false;
		}

		for (sourceKey in META_USER_KEY_MAP) {
			if (hasOwn(META_USER_KEY_MAP, sourceKey) && isBlank(userData[sourceKey]) === false) {
				targetKey = META_USER_KEY_MAP[sourceKey];
				if (advancedMatching[targetKey] !== userData[sourceKey]) {
					advancedMatching[targetKey] = userData[sourceKey];
					changed = true;
				}
			}
		}

		if (isBlank(userData.external_id) === false && externalId !== String(userData.external_id)) {
			externalId = String(userData.external_id);
			changed = true;
		}

		return changed;
	}

	function syncGlobalUserData() {
		if (window.tutorMetaUserData != null) {
			mergeUserData(window.tutorMetaUserData);
		}
	}

	function updateExternalId(userId) {
		if (isBlank(userId)) {
			return;
		}
		externalId = String(userId);
	}

	function buildInitUserData() {
		var userData = copyObject(advancedMatching);
		if (isBlank(externalId) === false) {
			userData.external_id = externalId;
		}
		return userData;
	}

	function ensurePixelInitialized() {
		var pixelId = getPixelId();
		var userData;

		if (pixelId.length == 0 || typeof window.fbq !== "function") {
			return false;
		}

		if (initialized === false) {
			syncGlobalUserData();
			userData = buildInitUserData();
			if (isEmptyObject(userData)) {
				window.fbq("init", pixelId);
			} else {
				window.fbq("init", pixelId, userData);
			}
			initialized = true;
		}

		return true;
	}

	function ensurePageView() {
		if (pageViewTracked === true) {
			return;
		}

		if (ensurePixelInitialized() === false) {
			return;
		}

		window.fbq("track", "PageView");
		pageViewTracked = true;
	}

	function buildEventPayload(eventName, payload) {
		var ecommerce = isObject(payload.ecommerce) ? payload.ecommerce : {};
		var items = isArray(ecommerce.items) ? ecommerce.items : [];
		var firstItem = items.length > 0 ? items[0] : null;
		var contents = buildContents(items);
		var data = {};

		addIfPresent(data, "currency", ecommerce.currency);
		addIfPresent(data, "value", normalizeNumber(ecommerce.value));

		if (contents.contentIds.length > 0) {
			data.content_ids = contents.contentIds;
			data.contents = contents.contents;
			data.content_type = "product";
			data.num_items = sumQuantity(items);
		}

		if (firstItem != null) {
			addIfPresent(data, "content_name", firstItem.item_name || firstItem.name);
		}

		if (eventName === "add_payment_info" || eventName === "purchase") {
			addIfPresent(data, "payment_type", ecommerce.payment_type);
		}

		if (eventName === "purchase") {
			addIfPresent(data, "order_id", ecommerce.transaction_id);
		}

		return data;
	}

	function buildTrackOptions(payload) {
		var options = {};
		if (isBlank(payload.event_id) === false) {
			options.eventID = String(payload.event_id);
		}
		return options;
	}

	function trackMetaEvent(payload) {
		var metaEventName = META_EVENT_MAP[payload.event];
		var params;
		var options;

		if (metaEventName == null) {
			return;
		}

		if (payload.user_data != null) {
			mergeUserData(payload.user_data);
		}

		ensurePageView();
		if (initialized === false) {
			return;
		}

		params = buildEventPayload(payload.event, payload);
		options = buildTrackOptions(payload);

		if (isEmptyObject(options)) {
			window.fbq("track", metaEventName, params);
		} else {
			window.fbq("track", metaEventName, params, options);
		}
	}

	function handlePayload(payload) {
		if (isObject(payload) === false) {
			return;
		}

		if (isBlank(payload.user_id) === false) {
			updateExternalId(payload.user_id);
			syncGlobalUserData();
		}

		if (payload.user_data != null) {
			mergeUserData(payload.user_data);
		}

		if (isBlank(payload.event) === false) {
			trackMetaEvent(payload);
		}
	}

	function patchDataLayer() {
		var existingItems;
		var originalPush;
		var i;

		window.dataLayer = window.dataLayer || [];
		existingItems = window.dataLayer.slice(0);

		if (window.dataLayer.tutorMetaPixelPatched !== true) {
			originalPush = typeof window.dataLayer.push === "function" ? window.dataLayer.push : Array.prototype.push;
			window.dataLayer.push = function() {
				var index;
				for (index = 0; index < arguments.length; index++) {
					handlePayload(arguments[index]);
				}
				return originalPush.apply(window.dataLayer, arguments);
			};
			window.dataLayer.tutorMetaPixelPatched = true;
		}

		for (i = 0; i < existingItems.length; i++) {
			handlePayload(existingItems[i]);
		}
	}

	patchDataLayer();
	window.setTimeout(function() {
		ensurePageView();
	}, 0);
})(window);

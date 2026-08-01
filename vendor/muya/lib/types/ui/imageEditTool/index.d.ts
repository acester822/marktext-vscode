import { Muya } from '../../index';
import { IImagePathSuggestion } from '../imagePicker';
import { IBaseOptions } from '../types';
import { default as BaseFloat } from '../baseFloat';
/**
 * Image state interface containing source, alt text and title
 */
interface IState {
    /** Image source URL or file path */
    src: string;
    /** Image alternative text */
    alt: string;
    /** Image title */
    title: string;
}
/**
 * Image edit tool options
 */
type Options = {
    /** Custom image path picker function (one-shot native file dialog) */
    imagePathPicker?: () => Promise<string>;
    /**
     * Local image path autocomplete hook. Given the current src input value,
     * returns a list of path suggestions to show in the floating
     * {@link ImagePathPicker}, typically backed by a filesystem directory
     * listing.
     */
    imagePathAutoComplete?: (src: string) => Promise<IImagePathSuggestion[]>;
    /** Image upload action handler */
    imageAction?: (state: IState) => Promise<string>;
} & IBaseOptions;
/**
 * Image edit tool for editing image source, alt text and title
 * Provides a float UI to edit image properties with optional file picker and upload support
 */
export declare class ImageEditTool extends BaseFloat {
    options: Options;
    static pluginName: string;
    capturesContentKeydown: boolean;
    /** Previous virtual node for patching */
    private _oldVNode;
    /** Current image information including token and ID */
    private _imageInfo;
    /** The block containing the image */
    private _block;
    /** Monotonic counter used to drop out-of-order imagePathAutoComplete responses */
    private _autoCompleteSeq;
    /** Current editing state */
    private _state;
    /** Active tab: file picker ("select") or link/path input ("link") */
    private _tab;
    /** Whether the link tab shows the alt and title inputs as well as src */
    private _isFullMode;
    /** Container element for the image selector */
    private _imageSelectorContainer;
    /**
     * Create image edit tool instance
     * @param muya - Muya editor instance
     * @param options - Tool options including image picker and upload handler
     */
    constructor(muya: Muya, options?: Options);
    /**
     * Listen to image selector events
     * Handles showing/hiding the tool and initializing state from image info
     */
    listen(): void;
    /**
     * Normalize file protocol in image source
     * Removes file:// or file:/// prefix for local paths
     */
    private _normalizeFileProtocol;
    /**
     * Focus and select the src input element
     */
    private _focusSrcInput;
    /**
     * Handle input change for an editable image field (src / alt / title).
     * @param event - Input event
     * @param type - Which image field the input edits
     */
    private _inputHandler;
    /**
     * Switch the active tab and re-render.
     * @param tab - Tab to activate
     */
    private _tabClick;
    /**
     * Toggle between simple (src only) and full (alt + src + title) mode.
     */
    private _toggleMode;
    /**
     * Handle keydown on the alt / title inputs — Enter confirms the change.
     * @param event - Keyboard event
     */
    private _handleKeyDown;
    /**
     * Locate the floating image-path picker if it is currently open.
     * Plugins are registered privately on Muya, so we resolve the instance via
     * the shared `ui.shownFloat` registry (the same pattern tableColumnToolbar
     * uses to find the format picker). Returns null when the picker plugin is
     * not registered or not currently shown.
     */
    private _getOpenImagePathPicker;
    /**
     * Handle keydown on the src input.
     * When the autocomplete picker is open, arrow keys / Tab / Enter drive the
     * picker (navigate + choose) instead of confirming. Otherwise Enter
     * confirms the change.
     * @param event - Keyboard event
     */
    private _handleSrcKeyDown;
    /**
     * Handle keyup on the src input.
     * Re-queries the `imagePathAutoComplete` hook (debounced via the browser's
     * natural keystroke cadence) and dispatches `muya-image-picker` so the
     * floating picker refreshes its suggestions. Navigation keys are ignored so
     * they don't re-trigger a fetch while the user is moving through the list.
     * @param event - Keyboard event
     */
    private _handleSrcKeyUp;
    /**
     * Confirm and apply image changes
     */
    private _handleConfirm;
    /**
     * Replace image asynchronously
     * Handles two scenarios:
     * 1. Direct replacement: when src is a URL or no imageAction provided
     * 2. Upload flow: when src is a local path and imageAction is available
     * @param param - Image state object
     * @param param.alt - Image alt text
     * @param param.src - Image source (local path or URL)
     * @param param.title - Image title
     */
    private _replaceImageAsync;
    /**
     * Replace image directly without upload
     * Only replaces if values have changed
     */
    private _replaceImageDirect;
    /**
     * Replace image with upload flow
     * Shows loading state, uploads the image, then replaces with uploaded URL
     */
    private _replaceImageWithUpload;
    /**
     * Hide the tool and dismiss the autocomplete picker alongside it so a
     * confirm/close never leaves a dangling suggestions dropdown.
     */
    hide(): void;
    /**
     * Handle click on the "Choose Image" button in the select tab.
     * Opens the one-shot native file picker and applies the chosen path
     * directly (matching the legacy ImageSelector select-tab behavior).
     */
    private _handleSelectButtonClick;
    /**
     * Render the tab header (Select / Embed link).
     */
    private _renderHeader;
    /**
     * Render the "Select" tab body: a Choose Image button and a tip.
     */
    private _renderSelectBody;
    /**
     * Render the "Embed link" tab body: the input container (src, plus alt and
     * title in full mode), the Embed button and the simple/full mode hint.
     */
    private _renderLinkBody;
    /**
     * Render the image edit tool UI as a tabbed selector matching the legacy
     * ImageSelector: a header (Select / Embed link) and the active tab body.
     */
    private _render;
}
export {};

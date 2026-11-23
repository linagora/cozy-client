//@ts-ignore
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
//@ts-ignore
import { Linking, Platform } from 'react-native'

const USER_CANCELED = 'USER_CANCELED'

/**
 * Opens a ReactNative InAppBrowser
 * and resolves with the URL containing
 * the token
 *
 * When the user close the InAppBrowser, the promise
 * rejects with USER_CANCELED message
 *
 * When the redirection URL contains `error=access_denied`
 * the promise rejects with USER_CANCELED message. This means
 * that the user closed the authorization popup
 *
 * @param {string} url
 * @returns {Promise}
 * @throws Will throw an "USER_CANCELED" message when the user cancel the authorization process
 */

export const authenticateWithReactNativeInAppBrowser = async url => {
  return new Promise((resolve, reject) => {
    let linkingSubscription = null

    InAppBrowser.open(url, {
      // iOS Properties
      readerMode: false,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'coverVertical',
      modalEnabled: true,
      enableBarCollapsing: false,
      // Android Properties
      showTitle: true,
      toolbarColor: '#8e9094',
      secondaryToolbarColor: 'black',
      enableUrlBarHiding: true,
      enableDefaultShare: true,
      forceCloseOnRedirection: false,
      showInRecents: true,
      // Specify full animation resource identifier(package:anim/name)
      // or only resource name(in case of animation bundled with app).
      animations: {
        startEnter: 'slide_in_right',
        startExit: 'slide_out_left',
        endEnter: 'slide_in_left',
        endExit: 'slide_out_right'
      }
    })
      .then(result => {
        if (result.type === 'cancel') {
          reject(USER_CANCELED)
        }
        return result
      })
      .catch(reject)

    const linkListener = ({ url }) => {
      let sanitizedUrl = url
      const accessCode = /\?access_code=(.+)$/.test(url)
      const state = /\?state=(.+)$/.test(url)
      const closeSignal = /\?error=access_denied$/.test(url)

      if (accessCode || state) {
        if (Platform.OS === 'ios') {
          // On iOS, the # added to the URL by the stack for security
          // reason is encoded to %23. Because of this, URL().searchParams
          // is not working as expected since %23 is added to the param
          // instead of being ignored and assigned to the hash.
          // Let's convert back %23 to # manually.
          // I think the issue is related to Linking component but didn't
          // find any issues on github about it. Need to make a simple
          // reproduction case to create the issue.

          if (url.endsWith('%23')) {
            sanitizedUrl = url.replace(/%23$/, '#')
          }
        }
        resolve(sanitizedUrl)
        linkingSubscription.remove()
        InAppBrowser.close()
      } else if (closeSignal) {
        reject(USER_CANCELED)
      }
    }

    linkingSubscription = Linking.addEventListener('url', linkListener)
  })
}

export const authFunction = authenticateWithReactNativeInAppBrowser

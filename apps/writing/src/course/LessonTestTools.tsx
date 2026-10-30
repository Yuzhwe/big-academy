import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { BAButton } from '@big-academy/design-system';

/** Designer Reset Lesson in the lesson top-bar end slot.
 * Confirm clears this lesson's answer records/progress and restarts at
 * question 1 in the formal lesson flow (does not enter Test Mode).
 * Cancel dismisses with no change.
 */
export function LessonTestTools({onReset,zh}:{onReset:()=>void;zh:boolean}) {
  return <div className="lesson-test-tools">
    <DialogTrigger>
      <BAButton variant="tertiary" size={36}>Reset Lesson</BAButton>
      <ModalOverlay isDismissable className="lesson-test-overlay">
        <Modal className="lesson-test-modal" data-ba-product="writing" lang={zh?'zh-CN':'en'}>
          <Dialog>
            {({close})=><>
              <Heading slot="title">{zh?'清除本课作答？':'Clear this lesson’s answers?'}</Heading>
              <p>{zh?'确认后将清除本课进度，并从第 1 题重新开始正式学习。':'Confirm to clear this lesson’s progress and continue from question 1 in the normal lesson.'}</p>
              <div className="lesson-test-actions">
                <BAButton size={36} variant="secondary" onPress={close}>{zh?'取消':'Cancel'}</BAButton>
                <BAButton size={36} onPress={()=>{close();onReset();}}>{zh?'确认清除':'Confirm clear answers'}</BAButton>
              </div>
            </>}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  </div>;
}

import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { BAButton } from '@big-academy/design-system';

/** Temporary designer tool. The confirmation never clears persistent storage. */
export function LessonTestTools({onReset,zh}:{onReset:()=>void;zh:boolean}) {
  return <div className="lesson-test-tools">
    <DialogTrigger>
      <BAButton variant="tertiary" size={36}>Reset Lesson</BAButton>
      <ModalOverlay isDismissable className="lesson-test-overlay">
        <Modal className="lesson-test-modal" data-ba-product="writing" lang={zh?'zh-CN':'en'}>
          <Dialog>
            {({close})=><>
              <Heading slot="title">{zh?'进入独立测试？':'Start a separate lesson test?'}</Heading>
              <p>{zh?'从 Activity 1 重新测试整课。正式学习记录会保留。':'Test the whole lesson from Activity 1. Your real learning record is preserved.'}</p>
              <div className="lesson-test-actions">
                <BAButton size={36} variant="secondary" onPress={close}>{zh?'取消':'Cancel'}</BAButton>
                <BAButton size={36} onPress={()=>{close();onReset();}}>{zh?'进入 Test Mode':'Enter Test Mode'}</BAButton>
              </div>
            </>}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  </div>;
}

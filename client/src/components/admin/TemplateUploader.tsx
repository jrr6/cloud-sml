import React, { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { Alert, AlertIcon, Button, Heading, Input, Stack } from '@chakra-ui/react'
import { IoMdCloudUpload } from 'react-icons/all'
import { OperationState } from '../AdminPanel'
import { ProjectFile } from '../../../../server/src/models/Project'

type TemplateUploaderProps = { token: string }
export const TemplateUploader: React.FC<TemplateUploaderProps> = ({ token }) => {
  const [templateName, setTemplateName] = useState('')
  const [uploadState, setUploadState] = useState(OperationState.NoOp)
  const fileInputRef = useRef(null as HTMLInputElement | null)

  const uploadTemplate = (e: FormEvent) => {
    e.preventDefault()
    setUploadState(OperationState.NoOp)
    fileInputRef.current?.click()
  }

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target!.files!
    Promise.all(
      Array.from(files).map(async (file: File, idx: number) => ({
        active: idx === 0,
        name: file.name,
        contents: await file.text()
      }))
    ).then((fileObjs: ProjectFile[]) =>
      fetch('http://localhost:8081/api/uploadTemplate', {
        method: 'POST',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: templateName,
          files: fileObjs
        })
      })
    ).then(res => {
      setUploadState(res.ok ? OperationState.Success : OperationState.Failure)
      setTemplateName('')
    })
  }

  return (
    <>
      <Heading as='h3' size='lg' marginBottom={10}>Upload Template</Heading>
      <form onSubmit={uploadTemplate}>
        <Stack spacing={3}>
          <Input placeholder='template name' value={templateName} onChange={e => { setTemplateName(e.target.value) }} />
          <Button colorScheme='purple' leftIcon={<IoMdCloudUpload />} disabled={templateName === ''} type='submit'>
            Select Files and Upload
          </Button>
          <input type='file' multiple ref={fileInputRef} onChange={onUpload} style={{ display: 'none' }} />
          <p><em>Files selected first in the dialog will appear at the top of the file list.</em></p>
          {uploadState !== OperationState.NoOp &&
          <Alert status={uploadState === OperationState.Success ? 'success' : 'error'} variant="left-accent">
            <AlertIcon />
            {uploadState === OperationState.Success ? 'Template uploaded successfully' : 'Failed to upload template'}
          </Alert>}
        </Stack>
      </form>
    </>
  )
}